import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  User,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  getDocFromServer,
  collection,
  query,
  getDocs,
  deleteDoc,
  orderBy,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { ResumeFormData, GenerationResult } from '../types/resume';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// CRITICAL: Must pass firebaseConfig.firestoreDatabaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((p) => ({
          providerId: p.providerId,
          email: p.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection test on boot per skill instructions
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration. The client is offline.');
    }
  }
}

// Authentication Helpers
export async function signInWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Save/update user profile in /users/{userId}
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);

    const now = new Date().toISOString();
    if (!userDoc.exists()) {
      await setDoc(userRef, {
        id: user.uid,
        email: user.email || '',
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        createdAt: now,
        updatedAt: now,
      });
    } else {
      await setDoc(
        userRef,
        {
          displayName: user.displayName || '',
          photoURL: user.photoURL || '',
          updatedAt: now,
        },
        { merge: true }
      );
    }

    return user;
  } catch (error) {
    console.error('Sign-in error:', error);
    throw error;
  }
}

export async function signOutUser(): Promise<void> {
  await firebaseSignOut(auth);
}

// Saved Resume Entity Interface
export interface StoredResumeRecord {
  id: string;
  userId: string;
  title: string;
  versionLabel?: string;
  versionNumber?: number;
  baseId?: string;
  formData: ResumeFormData;
  generatedResult?: GenerationResult | null;
  createdAt: string;
  updatedAt: string;
}

// Save or Update Resume in Firestore
export async function saveResumeToCloud(
  title: string,
  formData: ResumeFormData,
  generatedResult?: GenerationResult | null,
  existingId?: string,
  versionLabel?: string,
  versionNumber?: number,
  baseId?: string
): Promise<string> {
  if (!auth.currentUser) {
    throw new Error('You must be signed in to save resumes to your personal Cloud storage.');
  }

  const userId = auth.currentUser.uid;
  const resumeId = existingId || `res_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const path = `users/${userId}/resumes/${resumeId}`;
  const now = new Date().toISOString();

  try {
    const resumeRef = doc(db, 'users', userId, 'resumes', resumeId);
    const payload: StoredResumeRecord = {
      id: resumeId,
      userId,
      title: title || formData.contact.headline || formData.contact.fullName || 'Untitled Resume',
      versionLabel: (versionLabel || 'Draft 1').trim().substring(0, 100),
      versionNumber: versionNumber || 1,
      baseId: baseId || resumeId,
      formData,
      createdAt: now,
      updatedAt: now,
    };

    if (generatedResult) {
      payload.generatedResult = generatedResult;
    }

    await setDoc(resumeRef, payload, { merge: true });
    return resumeId;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
    throw err;
  }
}

// Update Version Label for an existing saved resume
export async function updateResumeVersionLabel(
  resumeId: string,
  newVersionLabel: string
): Promise<void> {
  if (!auth.currentUser) {
    throw new Error('You must be signed in to update resume versions.');
  }

  const userId = auth.currentUser.uid;
  const path = `users/${userId}/resumes/${resumeId}`;
  const now = new Date().toISOString();

  try {
    const resumeRef = doc(db, 'users', userId, 'resumes', resumeId);
    await setDoc(
      resumeRef,
      {
        versionLabel: newVersionLabel.trim().substring(0, 100),
        updatedAt: now,
      },
      { merge: true }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
    throw err;
  }
}

// List user's saved resumes
export async function listUserResumes(): Promise<StoredResumeRecord[]> {
  if (!auth.currentUser) return [];

  const userId = auth.currentUser.uid;
  const path = `users/${userId}/resumes`;

  try {
    const resumesRef = collection(db, 'users', userId, 'resumes');
    const q = query(resumesRef);
    const snapshot = await getDocs(q);

    const items: StoredResumeRecord[] = [];
    snapshot.forEach((docSnap) => {
      items.push(docSnap.data() as StoredResumeRecord);
    });

    // Sort in memory by updatedAt descending
    items.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    return items;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
    return [];
  }
}

// Delete user's saved resume
export async function deleteUserResume(resumeId: string): Promise<void> {
  if (!auth.currentUser) return;

  const userId = auth.currentUser.uid;
  const path = `users/${userId}/resumes/${resumeId}`;

  try {
    const resumeRef = doc(db, 'users', userId, 'resumes', resumeId);
    await deleteDoc(resumeRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

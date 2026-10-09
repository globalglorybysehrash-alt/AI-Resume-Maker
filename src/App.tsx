import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { StepForm } from './components/StepForm';
import { ResumePreview } from './components/ResumePreview';
import { CoverLetterPreview } from './components/CoverLetterPreview';
import { InterviewPrepView } from './components/InterviewPrepView';
import { MarketplaceSection } from './components/MarketplaceSection';
import { PrivacyAndFaqSection } from './components/PrivacyAndFaqSection';
import { SavedResumesModal } from './components/SavedResumesModal';
import { GlobalTemplatesHub } from './components/GlobalTemplatesHub';
import { JobSearchLaunchpad } from './components/JobSearchLaunchpad';
import { ResumeUploadModal } from './components/ResumeUploadModal';
import { LinkedInConnectModal } from './components/LinkedInConnectModal';
import { Footer } from './components/Footer';

import {
  ResumeFormData,
  GeneratedResumeData,
  GeneratedCoverLetterData,
  InterviewQuestionItem,
  GenerationResult,
  ResumeTemplateMeta,
} from './types/resume';
import { initialResumeFormData, samplePreloadData } from './data/sampleData';
import {
  auth,
  signInWithGoogle,
  signOutUser,
  testFirestoreConnection,
  saveResumeToCloud,
  listUserResumes,
  deleteUserResume,
  updateResumeVersionLabel,
  StoredResumeRecord,
} from './lib/firebase';
import { exportElementToPdf } from './lib/pdfExport';
import { User, onAuthStateChanged } from 'firebase/auth';
import {
  Sparkles,
  FileCheck2,
  Printer,
  Shield,
  Layers,
  CheckCircle2,
  ArrowRight,
  Cloud,
  Globe2,
  Briefcase,
  UploadCloud,
  FileText,
} from 'lucide-react';

import heroDeskImage from './assets/images/bookkaaro_hero_desk_1790748530055.jpg';

const LOCAL_STORAGE_KEY_FORM = 'bk_resume_form_draft_v1';
const LOCAL_STORAGE_KEY_GENERATED = 'bk_resume_generated_draft_v1';
const LOCAL_STORAGE_KEY_TEMPLATE = 'bk_resume_selected_template_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'builder' | 'templates' | 'jobs' | 'resume' | 'coverLetter' | 'interview' | 'marketplace' | 'faq'
  >('builder');

  // Active Global Resume Template
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(() => {
    try {
      return localStorage.getItem(LOCAL_STORAGE_KEY_TEMPLATE) || 'us-silicon-valley-ats';
    } catch {
      return 'us-silicon-valley-ats';
    }
  });

  // Direct Resume Upload Modal
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // LinkedIn Connect Modal
  const [isLinkedInModalOpen, setIsLinkedInModalOpen] = useState(false);

  // Firebase Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [cloudResumes, setCloudResumes] = useState<StoredResumeRecord[]>([]);
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);

  // Load initial form data from local browser storage
  const [formData, setFormData] = useState<ResumeFormData>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_FORM);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Could not read form draft from localStorage', e);
    }
    return initialResumeFormData;
  });

  // Load generated results from local browser storage
  const [generatedResult, setGeneratedResult] = useState<GenerationResult | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_GENERATED);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Could not read generated documents from localStorage', e);
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize and verify Firebase connection on boot
  useEffect(() => {
    testFirestoreConnection();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const list = await listUserResumes();
          setCloudResumes(list);
        } catch (e) {
          console.warn('Failed to load cloud resumes for user:', e);
        }
      } else {
        setCloudResumes([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // Sync draft to browser localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_FORM, JSON.stringify(formData));
    } catch (e) {
      console.warn('Failed to save form draft', e);
    }
  }, [formData]);

  useEffect(() => {
    try {
      if (generatedResult) {
        localStorage.setItem(LOCAL_STORAGE_KEY_GENERATED, JSON.stringify(generatedResult));
      } else {
        localStorage.removeItem(LOCAL_STORAGE_KEY_GENERATED);
      }
    } catch (e) {
      console.warn('Failed to save generated results', e);
    }
  }, [generatedResult]);

  // Sync selected template to browser localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_TEMPLATE, selectedTemplateId);
    } catch (e) {
      console.warn('Failed to save selected template', e);
    }
  }, [selectedTemplateId]);

  // Auth Handlers
  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error('Sign-in failed:', err);
      setErrorMessage(err?.message || 'Failed to sign in with Google.');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
    } catch (err: any) {
      console.error('Sign-out failed:', err);
    }
  };

  // Cloud Resume Handlers
  const handleSaveCurrentResume = async (
    title: string,
    versionLabel?: string,
    existingId?: string,
    baseId?: string
  ) => {
    if (!currentUser) {
      await handleSignIn();
      return;
    }

    try {
      // Calculate incremental version number if needed
      let versionNumber = 1;
      const matchingVersions = cloudResumes.filter(
        (r) =>
          (baseId && r.baseId === baseId) ||
          (r.title && title && r.title.toLowerCase().trim() === title.toLowerCase().trim())
      );

      if (matchingVersions.length > 0) {
        const highestVersion = Math.max(
          ...matchingVersions.map((v) => v.versionNumber || 1)
        );
        versionNumber = existingId
          ? (cloudResumes.find((r) => r.id === existingId)?.versionNumber || 1)
          : highestVersion + 1;
      }

      const assignedBaseId =
        baseId || matchingVersions[0]?.baseId || matchingVersions[0]?.id;

      await saveResumeToCloud(
        title,
        formData,
        generatedResult,
        existingId,
        versionLabel || 'Draft 1',
        versionNumber,
        assignedBaseId
      );
      const updated = await listUserResumes();
      setCloudResumes(updated);
    } catch (err: any) {
      console.error('Failed to save resume version:', err);
      throw err;
    }
  };

  const handleUpdateResumeLabel = async (id: string, newLabel: string) => {
    try {
      await updateResumeVersionLabel(id, newLabel);
      setCloudResumes((prev) =>
        prev.map((r) => (r.id === id ? { ...r, versionLabel: newLabel } : r))
      );
    } catch (err: any) {
      console.error('Failed to update resume label:', err);
      throw err;
    }
  };

  const handleDeleteResume = async (id: string) => {
    try {
      await deleteUserResume(id);
      setCloudResumes((prev) => prev.filter((r) => r.id !== id));
    } catch (err: any) {
      console.error('Failed to delete resume:', err);
    }
  };

  const handleLoadCloudResume = (record: StoredResumeRecord) => {
    if (record.formData) {
      setFormData(record.formData);
    }
    if (record.generatedResult) {
      setGeneratedResult(record.generatedResult);
      setActiveTab('resume');
    } else {
      setActiveTab('builder');
    }
    setErrorMessage(null);
  };

  // Select and apply country template
  const handleSelectTemplate = (template: ResumeTemplateMeta) => {
    setSelectedTemplateId(template.id);
    const isPhotoBanned = template.photoRule === 'Forbidden';

    setFormData((prev) => ({
      ...prev,
      targetJob: {
        ...prev.targetJob,
        targetCountry: template.country,
      },
      countrySpecifics: {
        targetCountry: template.country,
        includePhoto: !isPhotoBanned && (template.photoRule === 'Customary' || template.photoRule === 'Mandatory'),
        includeDob: template.country.includes('Germany'),
        includeNationality: template.country.includes('Emirates') || template.country.includes('Singapore'),
        includeVisaStatus:
          template.country.includes('Emirates') ||
          template.country.includes('Australia') ||
          template.country.includes('Canada') ||
          template.country.includes('Singapore'),
        includeReferees: template.country.includes('Australia') || template.country.includes('United Kingdom'),
        includeSignatureDate: template.country.includes('Germany'),
      },
    }));

    if (generatedResult) {
      setActiveTab('resume');
    } else {
      setActiveTab('builder');
    }
  };

  // Direct resume upload handler
  const handleApplyParsedResume = (parsed: Partial<ResumeFormData>) => {
    setFormData((prev) => ({
      ...prev,
      ...parsed,
      contact: {
        ...prev.contact,
        ...(parsed.contact || {}),
      },
      skills: {
        ...prev.skills,
        ...(parsed.skills || {}),
      },
      targetJob: {
        ...prev.targetJob,
        ...(parsed.targetJob || {}),
      },
      experiences:
        parsed.experiences && parsed.experiences.length > 0
          ? parsed.experiences
          : prev.experiences,
      education:
        parsed.education && parsed.education.length > 0
          ? parsed.education
          : prev.education,
      achievements:
        parsed.achievements && parsed.achievements.length > 0
          ? parsed.achievements
          : prev.achievements,
      summary: parsed.summary || prev.summary,
    }));
    setIsUploadModalOpen(false);
    setActiveTab('builder');
  };

  // LinkedIn profile data handler
  const handleApplyLinkedInData = (profileData: Partial<ResumeFormData>) => {
    setFormData((prev) => ({
      ...prev,
      ...profileData,
      contact: {
        ...prev.contact,
        ...(profileData.contact || {}),
      },
      skills: {
        ...prev.skills,
        ...(profileData.skills || {}),
      },
      targetJob: {
        ...prev.targetJob,
        ...(profileData.targetJob || {}),
      },
      experiences:
        profileData.experiences && profileData.experiences.length > 0
          ? profileData.experiences
          : prev.experiences,
      education:
        profileData.education && profileData.education.length > 0
          ? profileData.education
          : prev.education,
      summary: profileData.summary || prev.summary,
    }));
    setIsLinkedInModalOpen(false);
    setActiveTab('builder');
  };

  // Load sample profile
  const handleLoadSample = () => {
    setFormData(samplePreloadData);
    setErrorMessage(null);
    setActiveTab('builder');
  };

  // Clear draft
  const handleClearDraft = () => {
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY_FORM);
      localStorage.removeItem(LOCAL_STORAGE_KEY_GENERATED);
    } catch (e) {}
    setFormData(initialResumeFormData);
    setGeneratedResult(null);
    setErrorMessage(null);
    setActiveTab('builder');
  };

  // Trigger print
  const handlePrint = () => {
    window.print();
  };

  // Direct PDF Download
  const handleDownloadPdf = async () => {
    // If not on resume or coverLetter tab, switch to resume tab first so sheet is mounted
    if (activeTab !== 'resume' && activeTab !== 'coverLetter') {
      if (!generatedResult) {
        setActiveTab('builder');
        setErrorMessage('Please generate your resume first before downloading.');
        return;
      }
      setActiveTab('resume');
      // Wait for React to mount the document sheet
      await new Promise((resolve) => setTimeout(resolve, 350));
    }

    const isCover = activeTab === 'coverLetter';
    const targetElementId = isCover ? 'cover-letter-sheet' : 'resume-document-sheet';
    const baseName = (formData.contact.fullName || 'Candidate').trim().replace(/\s+/g, '_');
    const filename = isCover ? `${baseName}_Cover_Letter.pdf` : `${baseName}_Resume.pdf`;

    try {
      await exportElementToPdf(targetElementId, {
        filename,
        format: 'letter',
        marginMm: 8,
      });
    } catch (e) {
      console.warn('Direct PDF export error, falling back to window.print():', e);
      window.print();
    }
  };

  // Call Server-Side Gemini API
  const handleGenerate = async () => {
    if (!formData.contact.fullName.trim()) {
      setErrorMessage('Please provide at least your Full Name in Step 1 to generate documents.');
      setActiveTab('builder');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Server responded with status ${response.status}`);
      }

      setGeneratedResult({
        resume: data.resume,
        coverLetter: data.coverLetter,
        interviewQuestions: data.interviewQuestions,
        timestamp: data.timestamp || new Date().toISOString(),
      });

      // Switch to resume view to inspect results
      setActiveTab('resume');
    } catch (err: any) {
      console.error('Generation request failed:', err);
      setErrorMessage(
        err.message ||
          'Failed to communicate with the document generator. Please check your inputs and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Updaters for edited resume / cover letter state
  const handleSetResumeData: React.Dispatch<React.SetStateAction<GeneratedResumeData | null>> = (
    value
  ) => {
    setGeneratedResult((prev) => {
      if (!prev) return null;
      const nextResume = typeof value === 'function' ? value(prev.resume) : value;
      if (!nextResume) return prev;
      return { ...prev, resume: nextResume };
    });
  };

  const handleSetCoverLetterData: React.Dispatch<
    React.SetStateAction<GeneratedCoverLetterData | null>
  > = (value) => {
    setGeneratedResult((prev) => {
      if (!prev) return null;
      const nextCover = typeof value === 'function' ? value(prev.coverLetter) : value;
      if (!nextCover) return prev;
      return { ...prev, coverLetter: nextCover };
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* Top Header Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hasGeneratedData={Boolean(generatedResult)}
        onLoadSample={handleLoadSample}
        onClearDraft={handleClearDraft}
        onPrint={handlePrint}
        onDownloadPdf={handleDownloadPdf}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
        onOpenLinkedInModal={() => setIsLinkedInModalOpen(true)}
        user={currentUser}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
        onOpenSavedModal={() => setIsSavedModalOpen(true)}
        savedCount={cloudResumes.length}
      />

      {/* Main Content Area */}
      <main id="main-content" className="flex-1">
        {/* Hero Banner (Shown only on builder tab when not generating) */}
        {activeTab === 'builder' && (
          <div className="no-print bg-white border-b border-slate-200 py-10 sm:py-14">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <span>Authentic Global Career Studio</span>
                    <span aria-hidden="true">·</span>
                    <span>50 Country-Tailored Templates</span>
                    <span aria-hidden="true">·</span>
                    <span>Firebase Storage</span>
                  </div>

                  <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950 sm:leading-tight">
                    Fact-Verified Resumes &amp; Matching Cover Letters
                  </h1>

                  <p className="text-sm sm:text-base text-slate-600 max-w-xl leading-relaxed">
                    Build ATS-optimized resumes tailored to specific country requirements (US, UK, Germany, Canada, UAE, Australia, Japan &amp; more), matching cover letters, and STAR interview prep. Direct upload, instant PDF download, and live job portal links.
                  </p>

                  <div className="flex flex-wrap items-center gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsLinkedInModalOpen(true)}
                      className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-[#0A66C2] hover:bg-[#004182] rounded-lg transition-colors shadow-xs"
                      title="Connect with LinkedIn to auto-pull your verified profile data"
                    >
                      <span className="font-bold text-[10px] bg-white text-[#0A66C2] w-3.5 h-3.5 rounded flex items-center justify-center">
                        in
                      </span>
                      <span>Connect with LinkedIn</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('templates')}
                      className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
                    >
                      <Globe2 className="w-3.5 h-3.5 text-amber-400" />
                      Browse 50 Global Templates
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsUploadModalOpen(true)}
                      className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors"
                    >
                      <UploadCloud className="w-3.5 h-3.5 text-indigo-600" />
                      Direct Upload Resume
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('jobs')}
                      className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      <Briefcase className="w-3.5 h-3.5 text-slate-600" />
                      Job Search &amp; Guidelines
                    </button>

                    <button
                      type="button"
                      onClick={handleLoadSample}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      Try Sample
                    </button>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500 font-medium">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Country Compliance (Photos, DIN 5008, EEO)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Direct PDF &amp; Print Export</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>35+ Global Job Boards Linked</span>
                    </div>
                  </div>
                </div>

                {/* Hero Workspace Image */}
                <div className="lg:col-span-5 hidden sm:block">
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-md aspect-16/10">
                    <img
                      src={heroDeskImage}
                      alt="Minimalist desk with printed resume and fountain pen"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent flex items-end p-4">
                      <p className="text-white text-xs font-medium">
                        Country-specific formatting · Clean typography · Direct PDF download
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Views */}
        {activeTab === 'templates' && (
          <GlobalTemplatesHub
            onSelectTemplate={handleSelectTemplate}
            activeTemplateId={selectedTemplateId}
          />
        )}

        {activeTab === 'jobs' && (
          <JobSearchLaunchpad
            formData={formData}
            onOpenUploadModal={() => setIsUploadModalOpen(true)}
            onDownloadPdf={handleDownloadPdf}
            hasGeneratedData={Boolean(generatedResult)}
            onGoToResume={() => setActiveTab('resume')}
          />
        )}

        {activeTab === 'builder' && (
          <StepForm
            formData={formData}
            setFormData={setFormData}
            onGenerate={handleGenerate}
            isLoading={isLoading}
            errorMessage={errorMessage}
            onLoadSample={handleLoadSample}
            onOpenUploadModal={() => setIsUploadModalOpen(true)}
            onOpenLinkedInModal={() => setIsLinkedInModalOpen(true)}
            onOpenTemplatesHub={() => setActiveTab('templates')}
            activeTemplateId={selectedTemplateId}
            onSelectTemplateById={(id) => setSelectedTemplateId(id)}
          />
        )}

        {activeTab === 'resume' && (
          generatedResult ? (
            <ResumePreview
              resumeData={generatedResult.resume}
              setResumeData={handleSetResumeData}
              onPrint={handlePrint}
              onSaveToCloud={() => {
                if (!currentUser) {
                  handleSignIn();
                } else {
                  setIsSavedModalOpen(true);
                }
              }}
              activeTemplateId={selectedTemplateId}
              onSelectTemplate={handleSelectTemplate}
              onOpenTemplatesHub={() => setActiveTab('templates')}
            />
          ) : (
            <div className="max-w-xl mx-auto py-16 px-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-4">
                <FileText className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">No Resume Generated Yet</h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-md mx-auto leading-relaxed">
                Fill out your details in the Builder Form and click <strong>Generate Documents</strong>, or load a sample profile to preview your resume across our 50 global templates.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('builder')}
                  className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs"
                >
                  Go to Builder Form
                </button>
                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Load Sample Profile
                </button>
              </div>
            </div>
          )
        )}

        {activeTab === 'coverLetter' && (
          generatedResult ? (
            <CoverLetterPreview
              coverLetterData={generatedResult.coverLetter}
              setCoverLetterData={handleSetCoverLetterData}
              onPrint={handlePrint}
              activeTemplateId={selectedTemplateId}
            />
          ) : (
            <div className="max-w-xl mx-auto py-16 px-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-4">
                <FileText className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">No Cover Letter Generated Yet</h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-md mx-auto leading-relaxed">
                Add target company and job details in the Builder Form to automatically craft a tailored, fact-aligned cover letter.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('builder')}
                  className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs"
                >
                  Go to Builder Form
                </button>
                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Load Sample Profile
                </button>
              </div>
            </div>
          )
        )}

        {activeTab === 'interview' && (
          generatedResult ? (
            <InterviewPrepView
              questions={generatedResult.interviewQuestions}
              onPrint={handlePrint}
              jobTitle={formData.targetJob.title || formData.contact.headline || 'Software Professional'}
              companyName={formData.targetJob.company || 'Hiring Organization'}
            />
          ) : (
            <div className="max-w-xl mx-auto py-16 px-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-4">
                <FileText className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">No Interview Prep Generated Yet</h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-md mx-auto leading-relaxed">
                Generate your career dossier to receive custom STAR framework behavioral, technical, and situational interview questions.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('builder')}
                  className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs"
                >
                  Go to Builder Form
                </button>
                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Load Sample Profile
                </button>
              </div>
            </div>
          )
        )}

        {activeTab === 'marketplace' && <MarketplaceSection />}

        {activeTab === 'faq' && (
          <PrivacyAndFaqSection
            onClearDraft={handleClearDraft}
            onGoToBuilder={() => setActiveTab('builder')}
          />
        )}
      </main>

      {/* Direct Resume Upload Modal */}
      <ResumeUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onApplyParsedData={handleApplyParsedResume}
      />

      {/* LinkedIn Connect Modal */}
      <LinkedInConnectModal
        isOpen={isLinkedInModalOpen}
        onClose={() => setIsLinkedInModalOpen(false)}
        onApplyProfileData={handleApplyLinkedInData}
      />

      {/* Cloud Saved Resumes Modal */}
      <SavedResumesModal
        isOpen={isSavedModalOpen}
        onClose={() => setIsSavedModalOpen(false)}
        resumes={cloudResumes}
        onLoadResume={handleLoadCloudResume}
        onDeleteResume={handleDeleteResume}
        onSaveCurrentResume={handleSaveCurrentResume}
        onUpdateVersionLabel={handleUpdateResumeLabel}
        currentTitle={formData.contact.headline || formData.contact.fullName || 'My Professional Resume'}
        hasCurrentData={Boolean(formData.contact.fullName)}
      />

      {/* Footer */}
      <Footer onSelectTab={(tab) => setActiveTab(tab)} />
    </div>
  );
}

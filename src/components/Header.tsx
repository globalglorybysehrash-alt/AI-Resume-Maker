import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Trash2,
  Sparkles,
  BookOpen,
  Cloud,
  LogIn,
  LogOut,
  User as UserIcon,
  FileDown,
  Loader2,
  Globe2,
  Briefcase,
  UploadCloud,
} from 'lucide-react';
import { User } from 'firebase/auth';

interface HeaderProps {
  activeTab: 'builder' | 'templates' | 'jobs' | 'resume' | 'coverLetter' | 'interview' | 'marketplace' | 'faq';
  setActiveTab: (tab: 'builder' | 'templates' | 'jobs' | 'resume' | 'coverLetter' | 'interview' | 'marketplace' | 'faq') => void;
  hasGeneratedData: boolean;
  onLoadSample: () => void;
  onClearDraft: () => void;
  onPrint: () => void;
  onDownloadPdf?: () => Promise<void>;
  onOpenUploadModal?: () => void;
  onOpenLinkedInModal?: () => void;
  user: User | null;
  onSignIn: () => void;
  onSignOut: () => void;
  onOpenSavedModal: () => void;
  savedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  hasGeneratedData,
  onLoadSample,
  onClearDraft,
  onPrint,
  onDownloadPdf,
  onOpenUploadModal,
  onOpenLinkedInModal,
  user,
  onSignIn,
  onSignOut,
  onOpenSavedModal,
  savedCount,
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleHeaderPdf = async () => {
    if (!onDownloadPdf) return;
    setIsExporting(true);
    try {
      await onDownloadPdf();
    } finally {
      setIsExporting(false);
    }
  };
  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-30 no-print">
      {/* Accessibility Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-slate-900 focus:text-white focus:px-4 focus:py-2 focus:rounded-md text-sm font-medium"
      >
        Skip to main content
      </a>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('builder')}
              className="text-left group flex items-center gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 rounded"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm tracking-wider">
                BK
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-tight text-slate-900 group-hover:text-slate-700 transition-colors">
                  Book Kaaro
                </span>
                <span className="text-xs text-slate-500 font-medium">Career Studio</span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 text-xs xl:text-sm font-medium text-slate-600" aria-label="Main Navigation">
            <button
              onClick={() => setActiveTab('builder')}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'builder'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Builder Form
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'templates'
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Globe2 className="w-3.5 h-3.5" />
              <span>50 Global Templates</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === 'templates' ? 'bg-amber-400 text-slate-900' : 'bg-amber-100 text-amber-800'
              }`}>
                Viral
              </span>
            </button>
            <button
              onClick={() => setActiveTab('jobs')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'jobs'
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Job Search &amp; Guidelines</span>
            </button>
            <button
              onClick={() => setActiveTab('resume')}
              disabled={!hasGeneratedData}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'resume'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : hasGeneratedData
                  ? 'hover:text-slate-900 hover:bg-slate-50'
                  : 'text-slate-300 cursor-not-allowed'
              }`}
            >
              Resume
            </button>
            <button
              onClick={() => setActiveTab('coverLetter')}
              disabled={!hasGeneratedData}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'coverLetter'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : hasGeneratedData
                  ? 'hover:text-slate-900 hover:bg-slate-50'
                  : 'text-slate-300 cursor-not-allowed'
              }`}
            >
              Cover Letter
            </button>
            <button
              onClick={() => setActiveTab('interview')}
              disabled={!hasGeneratedData}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'interview'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : hasGeneratedData
                  ? 'hover:text-slate-900 hover:bg-slate-50'
                  : 'text-slate-300 cursor-not-allowed'
              }`}
            >
              Interview Prep
            </button>
            <button
              onClick={() => setActiveTab('marketplace')}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'marketplace'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Packs
            </button>
            <button
              onClick={() => setActiveTab('faq')}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'faq'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Privacy &amp; Guide
            </button>
          </nav>

          {/* Zone 3: Actions + Firebase Auth */}
          <div className="flex items-center gap-2">
            {/* Connect LinkedIn Button */}
            {onOpenLinkedInModal && (
              <button
                type="button"
                onClick={onOpenLinkedInModal}
                className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-white bg-[#0A66C2] hover:bg-[#004182] rounded-lg transition-colors whitespace-nowrap shadow-2xs"
                title="Connect with LinkedIn to auto-pull your verified profile data"
              >
                <span className="font-bold text-[10px] bg-white text-[#0A66C2] w-3.5 h-3.5 rounded flex items-center justify-center">
                  in
                </span>
                <span className="hidden xl:inline">LinkedIn</span>
              </button>
            )}

            {/* Direct Upload Button */}
            {onOpenUploadModal && (
              <button
                type="button"
                onClick={onOpenUploadModal}
                className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
                title="Directly upload an existing resume (JSON, text, or markdown) to populate the builder"
              >
                <UploadCloud className="w-3.5 h-3.5 text-indigo-600" />
                <span>Upload Resume</span>
              </button>
            )}

            {/* Cloud Resumes Button */}
            {user && (
              <button
                type="button"
                onClick={onOpenSavedModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors whitespace-nowrap"
                title="View your saved resumes stored securely in Firebase"
              >
                <Cloud className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">Cloud Resumes</span>
                {savedCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-emerald-700 text-white text-[10px] flex items-center justify-center font-bold">
                    {savedCount}
                  </span>
                )}
              </button>
            )}

            {/* User Auth Sign-In / Profile */}
            {user ? (
              <div className="flex items-center gap-2">
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-medium text-slate-800"
                  title={`Signed in as ${user.email}`}
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      referrerPolicy="no-referrer"
                      className="w-4 h-4 rounded-full"
                    />
                  ) : (
                    <UserIcon className="w-3.5 h-3.5 text-slate-500" />
                  )}
                  <span className="hidden md:inline max-w-[100px] truncate">
                    {user.displayName || user.email?.split('@')[0]}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onSignOut}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onSignIn}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors whitespace-nowrap"
                title="Sign in with Google to sync resumes to your private cloud storage"
              >
                <LogIn className="w-3.5 h-3.5 text-slate-600" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}

            <button
              type="button"
              onClick={onLoadSample}
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap focus-visible:ring-2 focus-visible:ring-slate-900"
              title="Prepopulate the form with a verified sample career profile"
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-600" />
              Sample
            </button>

            <button
              type="button"
              onClick={onClearDraft}
              className="inline-flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium text-slate-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors whitespace-nowrap focus-visible:ring-2 focus-visible:ring-red-600"
              title="Erase all draft inputs from browser local memory"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Clear</span>
            </button>

            {hasGeneratedData && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleHeaderPdf}
                  disabled={isExporting}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 rounded-lg transition-colors whitespace-nowrap shadow-xs focus-visible:ring-2 focus-visible:ring-slate-900"
                  title="Directly export and download high-resolution PDF"
                >
                  {isExporting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <FileDown className="w-3.5 h-3.5 text-emerald-300" />
                  )}
                  <span>PDF</span>
                </button>

                <button
                  type="button"
                  onClick={onPrint}
                  className="hidden sm:inline-flex items-center p-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Browser print dialogue"
                >
                  <Printer className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="lg:hidden flex items-center justify-between overflow-x-auto py-2 border-t border-slate-100 text-xs gap-1">
          <button
            onClick={() => setActiveTab('builder')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${
              activeTab === 'builder' ? 'bg-slate-900 text-white font-medium' : 'text-slate-600'
            }`}
          >
            Form
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${
              activeTab === 'templates' ? 'bg-slate-900 text-white font-medium' : 'text-slate-600'
            }`}
          >
            50 Templates
          </button>
          <button
            onClick={() => setActiveTab('jobs')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${
              activeTab === 'jobs' ? 'bg-slate-900 text-white font-medium' : 'text-slate-600'
            }`}
          >
            Job Boards
          </button>
          <button
            onClick={() => setActiveTab('resume')}
            disabled={!hasGeneratedData}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${
              activeTab === 'resume'
                ? 'bg-slate-900 text-white font-medium'
                : hasGeneratedData
                ? 'text-slate-600'
                : 'text-slate-300'
            }`}
          >
            Resume
          </button>
          <button
            onClick={() => setActiveTab('coverLetter')}
            disabled={!hasGeneratedData}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${
              activeTab === 'coverLetter'
                ? 'bg-slate-900 text-white font-medium'
                : hasGeneratedData
                ? 'text-slate-600'
                : 'text-slate-300'
            }`}
          >
            Cover
          </button>
          <button
            onClick={() => setActiveTab('interview')}
            disabled={!hasGeneratedData}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${
              activeTab === 'interview'
                ? 'bg-slate-900 text-white font-medium'
                : hasGeneratedData
                ? 'text-slate-600'
                : 'text-slate-300'
            }`}
          >
            Interview
          </button>
          <button
            onClick={() => setActiveTab('marketplace')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${
              activeTab === 'marketplace' ? 'bg-slate-900 text-white font-medium' : 'text-slate-600'
            }`}
          >
            Packs
          </button>
          <button
            onClick={() => setActiveTab('faq')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${
              activeTab === 'faq' ? 'bg-slate-900 text-white font-medium' : 'text-slate-600'
            }`}
          >
            Guide
          </button>
        </div>
      </div>
    </header>
  );
};


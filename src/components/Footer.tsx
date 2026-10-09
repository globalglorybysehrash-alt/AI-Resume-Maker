import React from 'react';

interface FooterProps {
  onSelectTab: (tab: 'builder' | 'templates' | 'jobs' | 'resume' | 'coverLetter' | 'interview' | 'marketplace' | 'faq') => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab }) => {
  return (
    <footer className="no-print mt-auto border-t border-slate-200 bg-white py-12 text-slate-600 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand & Purpose */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                BK
              </div>
              <span className="font-bold text-slate-900 text-sm tracking-tight">
                Book Kaaro Career Studio
              </span>
            </div>
            <p className="text-slate-500 max-w-sm leading-relaxed text-xs">
              An accessible, privacy-first career document suite. We help candidates articulate their genuine
              skills, work history, and achievements across 50+ countries without artificial embellishment or fabricated metrics.
            </p>
          </div>

          {/* Tools & Views */}
          <div>
            <span className="font-semibold text-slate-900 block mb-3 text-xs tracking-wider uppercase">
              Application Tools
            </span>
            <ul className="space-y-2 text-slate-500">
              <li>
                <button
                  onClick={() => onSelectTab('builder')}
                  className="hover:text-slate-900 transition-colors"
                >
                  Step-by-Step Intake
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('templates')}
                  className="hover:text-slate-900 transition-colors text-amber-700 font-medium"
                >
                  50 Global Templates
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('jobs')}
                  className="hover:text-slate-900 transition-colors text-slate-900 font-medium"
                >
                  Job Boards &amp; Guidelines
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('resume')}
                  className="hover:text-slate-900 transition-colors"
                >
                  Structured Resume
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('coverLetter')}
                  className="hover:text-slate-900 transition-colors"
                >
                  Matching Cover Letter
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('interview')}
                  className="hover:text-slate-900 transition-colors"
                >
                  STAR Interview Prep
                </button>
              </li>
            </ul>
          </div>

          {/* Ethics & Resources */}
          <div>
            <span className="font-semibold text-slate-900 block mb-3 text-xs tracking-wider uppercase">
              Ethics &amp; Catalog
            </span>
            <ul className="space-y-2 text-slate-500">
              <li>
                <button
                  onClick={() => onSelectTab('marketplace')}
                  className="hover:text-slate-900 transition-colors"
                >
                  Career Templates Pack
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('faq')}
                  className="hover:text-slate-900 transition-colors"
                >
                  Privacy Commitment
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('faq')}
                  className="hover:text-slate-900 transition-colors"
                >
                  ATS Reality &amp; FAQs
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Ethical Disclaimer & Copyright */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <p className="max-w-2xl leading-normal text-center sm:text-left">
            Ethical Disclaimer: Book Kaaro AI Resume &amp; Cover Letter Builder processes your facts transiently.
            We make no warranties or guarantees regarding applicant tracking system (ATS) pass rates, interview callbacks,
            or employment offers. Hiring decisions are made by independent employers.
          </p>
          <div className="shrink-0 font-mono">
            &copy; {new Date().getFullYear()} Book Kaaro Studio. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

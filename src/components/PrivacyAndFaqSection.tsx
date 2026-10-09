import React from 'react';
import {
  ShieldCheck,
  Lock,
  Trash2,
  FileCheck,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

interface PrivacyAndFaqSectionProps {
  onClearDraft: () => void;
  onGoToBuilder: () => void;
}

export const PrivacyAndFaqSection: React.FC<PrivacyAndFaqSectionProps> = ({
  onClearDraft,
  onGoToBuilder,
}) => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
      {/* Privacy Architecture Declaration */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Privacy &amp; Data Minimization Policy</h2>
            <p className="text-xs text-slate-500">How Book Kaaro handles your career data</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-slate-700 leading-relaxed mt-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="font-semibold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Zero Server-Side Persistence
            </div>
            <p className="text-slate-600 text-xs">
              Your resume details are never saved to an external database, user tracking platform, or cloud bucket.
              Generation requests are processed in-memory via server-side Gemini endpoints and immediately discarded.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="font-semibold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              No Analytics or Telemetry Scraping
            </div>
            <p className="text-slate-600 text-xs">
              We do not log personal identifiable information (PII), employer names, addresses, or phone numbers.
              No commercial analytics scripts intercept your typed text.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="font-semibold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Browser-Only Local Draft Storage
            </div>
            <p className="text-slate-600 text-xs">
              Any unsaved progress is kept only inside your personal browser&apos;s localStorage cache. You can wipe
              this at any moment with the Clear Draft button.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="font-semibold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Fact-Preservation Mandate
            </div>
            <p className="text-slate-600 text-xs">
              Unlike generic AI tools that invent fake accomplishments or imaginary titles, Book Kaaro enforces strict
              hallucination limits. Incomplete items are flagged as bracketed placeholders for you to verify.
            </p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-slate-500">
            Want to immediately purge all cached draft data from this browser?
          </span>
          <button
            type="button"
            onClick={onClearDraft}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors border border-rose-200"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Purge Local Draft Now
          </button>
        </div>
      </section>

      {/* Honest Career FAQ & Instructions */}
      <section className="space-y-6">
        <div className="text-center sm:text-left mb-6">
          <h2 className="text-xl font-bold text-slate-900">Career Builder Guide &amp; FAQ</h2>
          <p className="text-xs text-slate-500 mt-1">
            Pragmatic answers to common questions about resumes, ATS algorithms, and career documents.
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-slate-700" />
              Does Book Kaaro guarantee 100% ATS score or interview callbacks?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              <strong>No tool can honestly guarantee ATS pass rates or job offers.</strong> Modern applicant tracking
              systems parse text into standard categories. We design clean, single-column typographical layouts that
              avoid text-box parsing failures, tables, and graphic overlays that break ATS scanners. Authentic hiring
              decisions depend on human recruiters reviewing verifiable achievements.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-slate-700" />
              Why are there bracketed tags like <span className="font-mono text-xs text-amber-800 bg-amber-100 px-1 rounded">[Add metric]</span> in my generated resume?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              Our AI is strictly instructed <strong>never to hallucinate numbers or invent metrics</strong>. If you
              wrote &quot;improved API performance&quot; without stating percentages or milliseconds, the generator
              leaves an explicit placeholder so you can fill in your actual metric rather than submitting fake data
              that could unravel during an interview.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-slate-700" />
              How do I export my resume as a PDF?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              Click the <strong>Print / PDF</strong> button on any preview tab or press <kbd className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded border border-slate-200">Ctrl+P</kbd> (or <kbd className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded border border-slate-200">Cmd+P</kbd>). In your browser&apos;s print dialogue, set the destination to <em>&quot;Save as PDF&quot;</em>. Our custom print stylesheet automatically hides all buttons, tabs, and navigation, ensuring your exported document has ink-clean formatting and crisp margins.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-slate-700" />
              Can I customize the wording after generation?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              Yes! Click <strong>Edit Document</strong> at the top of the resume or cover letter sheet to edit every
              bullet point, heading, and paragraph directly. You have 100% editorial control over your career story.
            </p>
          </div>
        </div>

        {/* CTA to start building */}
        <div className="mt-8 p-6 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold">Ready to build your career dossier?</h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Fill in your verified background or test with our sample profile.
            </p>
          </div>
          <button
            type="button"
            onClick={onGoToBuilder}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded-lg transition-colors shrink-0"
          >
            Open Builder Form <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>
    </div>
  );
};

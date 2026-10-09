import React, { useState } from 'react';
import { InterviewQuestionItem } from '../types/resume';
import { MockInterviewScheduler } from './MockInterviewScheduler';
import {
  HelpCircle,
  AlertTriangle,
  CheckCircle2,
  Printer,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Calendar,
  Sparkles,
} from 'lucide-react';

interface InterviewPrepViewProps {
  questions: InterviewQuestionItem[];
  onPrint: () => void;
  jobTitle?: string;
  companyName?: string;
}

export const InterviewPrepView: React.FC<InterviewPrepViewProps> = ({
  questions,
  onPrint,
  jobTitle = 'Target Role',
  companyName = 'Target Company',
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(
    questions.length > 0 ? questions[0].id : null
  );
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [showScheduler, setShowScheduler] = useState<boolean>(true);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleNoteChange = (id: string, text: string) => {
    setNotes((prev) => ({ ...prev, [id]: text }));
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Action Toolbar */}
      <div className="no-print mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">Tailored Interview Questions &amp; Mock Practice</h2>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-0.5">
            <span>Role-Specific</span>
            <span aria-hidden="true">·</span>
            <span>STAR Method Blueprints</span>
            <span aria-hidden="true">·</span>
            <span>Calendar .ics Export</span>
            <span aria-hidden="true">·</span>
            <span>Pitfall Warnings</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowScheduler(!showScheduler)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors border shadow-2xs ${
              showScheduler
                ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-indigo-600" />
            <span>{showScheduler ? 'Hide Calendar' : 'Schedule Mock (.ics)'}</span>
          </button>

          <button
            type="button"
            onClick={onPrint}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Interactive Mock Interview Calendar Scheduler */}
      {showScheduler && (
        <MockInterviewScheduler
          questions={questions}
          jobTitle={jobTitle}
          companyName={companyName}
        />
      )}

      {/* Guide Banner */}
      <div className="no-print mb-6 p-4 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 space-y-2">
        <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
          <BookOpen className="w-4 h-4 text-slate-700" />
          STAR Answering Framework (Situation · Task · Action · Result)
        </div>
        <p className="leading-relaxed">
          These questions are calibrated to your verified experiences. Never claim technologies or achievements
          you haven't personally handled. When asked about unfamiliar tools, pivot to how you quickly mastered
          similar tools in your past roles.
        </p>
      </div>

      {/* Question Cards */}
      <div className="space-y-4">
        {questions.map((q, idx) => {
          const isExpanded = expandedId === q.id;

          return (
            <div
              key={q.id || idx}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs print-break-inside-avoid"
            >
              <button
                type="button"
                onClick={() => toggleExpand(q.id)}
                className="w-full text-left p-5 flex items-start justify-between gap-4 hover:bg-slate-50/50 transition-colors focus:outline-none"
              >
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                        {q.category}
                      </span>
                    </div>
                    <h3 className="text-sm sm:text-base font-semibold text-slate-900 leading-snug">
                      {q.question}
                    </h3>
                  </div>
                </div>

                <div className="text-slate-400 shrink-0 mt-1 no-print">
                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </button>

              {/* Expanded details (Always visible on print) */}
              <div className={`p-5 pt-0 border-t border-slate-100 ${isExpanded ? 'block' : 'hidden print:block'}`}>
                <div className="mt-4 space-y-4">
                  {/* Context / Why this is asked */}
                  <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg">
                    <span className="font-semibold text-slate-800">Interviewer Intent: </span>
                    {q.context}
                  </div>

                  {/* STAR Breakdown */}
                  <div className="border border-slate-200 rounded-lg p-4 bg-white">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                      Recommended Answer Architecture (STAR)
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-2.5 rounded bg-slate-50 border border-slate-100">
                        <span className="font-bold text-slate-900 block mb-1">1. Situation</span>
                        <p className="text-slate-700 leading-relaxed">{q.starFramework.situation}</p>
                      </div>
                      <div className="p-2.5 rounded bg-slate-50 border border-slate-100">
                        <span className="font-bold text-slate-900 block mb-1">2. Task</span>
                        <p className="text-slate-700 leading-relaxed">{q.starFramework.task}</p>
                      </div>
                      <div className="p-2.5 rounded bg-slate-50 border border-slate-100">
                        <span className="font-bold text-slate-900 block mb-1">3. Action (Your role)</span>
                        <p className="text-slate-700 leading-relaxed">{q.starFramework.action}</p>
                      </div>
                      <div className="p-2.5 rounded bg-slate-50 border border-slate-100">
                        <span className="font-bold text-slate-900 block mb-1">4. Result (Impact)</span>
                        <p className="text-slate-700 leading-relaxed">{q.starFramework.result}</p>
                      </div>
                    </div>
                  </div>

                  {/* Pitfall Warning */}
                  <div className="flex items-start gap-2.5 p-3 rounded-lg border border-amber-200 bg-amber-50/60 text-amber-900 text-xs">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold">Honesty Guardrail: </span>
                      {q.pitfallWarning}
                    </div>
                  </div>

                  {/* Personal Practice Notes (No-print) */}
                  <div className="no-print pt-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Your Personal Notes &amp; Practice Anecdotes
                    </label>
                    <textarea
                      rows={2}
                      value={notes[q.id] || ''}
                      onChange={(e) => handleNoteChange(q.id, e.target.value)}
                      placeholder="Type your authentic project story or key metrics to remember during the call..."
                      className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

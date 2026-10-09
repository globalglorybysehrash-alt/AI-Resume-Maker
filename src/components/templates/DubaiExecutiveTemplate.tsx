import React from 'react';
import { TemplateRenderProps, ACCENT_COLOR_MAP } from './templateTypes';
import { User, ShieldCheck, Award, MapPin, Mail, Phone, CheckCircle2 } from 'lucide-react';

export const DubaiExecutiveTemplate: React.FC<TemplateRenderProps> = ({
  resumeData,
  setResumeData,
  isEditing,
  renderTextWithPlaceholderHighlight,
  density,
  fontMode,
  showPhoto,
  onUploadPhotoClick,
}) => {
  const fontClass =
    fontMode === 'serif' ? 'font-serif' : fontMode === 'mono' ? 'font-mono' : 'font-sans';
  const spacingClass =
    density === 'compact' ? 'space-y-4' : density === 'comfortable' ? 'space-y-7' : 'space-y-5';

  return (
    <div className={`${fontClass} ${spacingClass} text-slate-900 leading-normal`}>
      {/* UAE Luxury Executive Masthead */}
      <header className="p-6 bg-gradient-to-r from-[#0b1e36] via-[#102a4c] to-[#0b1e36] text-white rounded-xl shadow-md border-b-2 border-amber-500/80">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-5">
          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold uppercase tracking-wider border border-amber-400/30">
                UAE &amp; GCC Executive Dossier
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold flex items-center gap-1 border border-emerald-400/30">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>Golden Visa / Transferable Employment Visa</span>
              </span>
            </div>

            {isEditing ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={resumeData.header.fullName}
                  onChange={(e) =>
                    setResumeData((prev) =>
                      prev ? { ...prev, header: { ...prev.header, fullName: e.target.value } } : prev
                    )
                  }
                  className="w-full text-2xl font-bold bg-white/10 text-white p-1 rounded border border-white/20 focus:outline-none"
                />
                <input
                  type="text"
                  value={resumeData.header.headline}
                  onChange={(e) =>
                    setResumeData((prev) =>
                      prev ? { ...prev, header: { ...prev.header, headline: e.target.value } } : prev
                    )
                  }
                  className="w-full text-sm font-semibold bg-white/10 text-amber-200 p-1 rounded border border-white/20 focus:outline-none"
                />
              </div>
            ) : (
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  {resumeData.header.fullName}
                </h1>
                <p className="text-sm font-semibold text-amber-300 tracking-wide mt-0.5">
                  {renderTextWithPlaceholderHighlight(resumeData.header.headline)}
                </p>
              </div>
            )}

            {/* Coordinates line */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1.5 text-xs text-slate-300 pt-1">
              {resumeData.header.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-amber-400" />
                  {resumeData.header.location}
                </span>
              )}
              {resumeData.header.email && (
                <span className="flex items-center gap-1">
                  <Mail className="w-3 h-3 text-amber-400" />
                  <a href={`mailto:${resumeData.header.email}`} className="hover:underline">
                    {resumeData.header.email}
                  </a>
                </span>
              )}
              {resumeData.header.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-amber-400" />
                  {resumeData.header.phone}
                </span>
              )}
              <span className="flex items-center gap-1 text-slate-300">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>UAE Driving License: Valid</span>
              </span>
            </div>
          </div>

          {/* Executive Headshot Photo Slot (only if photo provided) */}
          {showPhoto && resumeData.header.photoUrl && (
            <div className="shrink-0 flex flex-col items-center">
              <div className="w-24 h-30 rounded-lg overflow-hidden border-2 border-amber-400 shadow-md bg-white flex items-center justify-center">
                <img
                  src={resumeData.header.photoUrl}
                  alt={resumeData.header.fullName}
                  className="w-full h-full object-cover"
                />
              </div>
              {isEditing && onUploadPhotoClick && (
                <button
                  type="button"
                  onClick={onUploadPhotoClick}
                  className="no-print mt-1 text-[10px] text-amber-300 underline font-medium"
                >
                  Change Photo
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Strategic Executive Summary */}
      <section className="p-4 rounded-xl bg-amber-50/40 border border-amber-200/80 print-break-inside-avoid">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#0b1e36] mb-1.5 flex items-center gap-1.5">
          <Award className="w-3.5 h-3.5 text-amber-600" />
          <span>Executive Value Proposition &amp; Regional Mandate</span>
        </h2>
        {isEditing ? (
          <textarea
            rows={3}
            value={resumeData.summary}
            onChange={(e) =>
              setResumeData((prev) => (prev ? { ...prev, summary: e.target.value } : prev))
            }
            className="w-full p-2 text-xs border border-slate-300 rounded leading-relaxed focus:outline-none"
          />
        ) : (
          <p className="text-xs sm:text-[13px] text-slate-800 leading-relaxed font-medium">
            {renderTextWithPlaceholderHighlight(resumeData.summary)}
          </p>
        )}
      </section>

      {/* Executive Core Competencies in 3-Column Micro-Grid */}
      {resumeData.skills && resumeData.skills.length > 0 && (
        <section className="print-break-inside-avoid">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#0b1e36] border-b border-[#0b1e36]/30 pb-1 mb-2.5">
            Core Executive Competencies &amp; Strategic Domains
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {resumeData.skills.map((skillGroup, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg border border-slate-200 bg-white shadow-2xs space-y-1"
              >
                <span className="text-[11px] font-bold text-[#0b1e36] uppercase tracking-wide block border-b border-slate-100 pb-1">
                  {skillGroup.categoryName}
                </span>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {skillGroup.items.join(' · ')}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Professional Leadership Experience */}
      {resumeData.experience && resumeData.experience.length > 0 && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#0b1e36] border-b border-[#0b1e36]/30 pb-1 mb-4">
            Professional Experience &amp; P&amp;L Leadership
          </h2>

          <div className="space-y-5">
            {resumeData.experience.map((exp, eIdx) => (
              <div key={eIdx} className="print-break-inside-avoid border-l-2 border-amber-500/80 pl-4 ml-1">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-1">
                  <div>
                    <span className="font-bold text-sm text-[#0b1e36]">{exp.role}</span>
                    <span className="text-slate-700 text-sm font-semibold"> — {exp.company}</span>
                  </div>
                  <div className="text-xs text-slate-500 font-mono tracking-tight sm:text-right">
                    <span>{exp.dates}</span>
                    {exp.location && <span className="font-semibold text-slate-700"> · {exp.location}</span>}
                  </div>
                </div>

                <ul className="mt-2 space-y-1.5 list-disc list-outside pl-4 text-xs text-slate-800 leading-relaxed">
                  {exp.bullets.map((bullet, bIdx) => (
                    <li key={bIdx}>
                      {isEditing ? (
                        <textarea
                          rows={2}
                          value={bullet}
                          onChange={(e) => {
                            const val = e.target.value;
                            setResumeData((prev) => {
                              if (!prev) return prev;
                              const updated = [...prev.experience];
                              const bList = [...updated[eIdx].bullets];
                              bList[bIdx] = val;
                              updated[eIdx] = { ...updated[eIdx], bullets: bList };
                              return { ...prev, experience: updated };
                            });
                          }}
                          className="w-full text-xs p-1 border border-slate-200 rounded"
                        />
                      ) : (
                        <span>{renderTextWithPlaceholderHighlight(bullet)}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education & Credentials */}
      {resumeData.education && resumeData.education.length > 0 && (
        <section className="print-break-inside-avoid">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#0b1e36] border-b border-[#0b1e36]/30 pb-1 mb-2.5">
            Academic Credentials &amp; Executive Education
          </h2>
          <div className="space-y-2 text-xs">
            {resumeData.education.map((edu, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-baseline justify-between">
                <div>
                  <span className="font-bold text-slate-950">{edu.degree}</span>
                  <span className="text-slate-700">, {edu.institution}</span>
                  {edu.details && <span className="text-slate-500 italic"> ({edu.details})</span>}
                </div>
                <div className="text-xs font-mono text-slate-500">{edu.dates}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Strategic Honors & Board Appointments */}
      {resumeData.achievements && resumeData.achievements.length > 0 && (
        <section className="print-break-inside-avoid">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#0b1e36] border-b border-[#0b1e36]/30 pb-1 mb-2.5">
            Key Honors, Awards &amp; Industry Affiliations
          </h2>
          <ul className="space-y-1.5 text-xs text-slate-800 list-disc list-outside pl-4">
            {resumeData.achievements.map((ach, idx) => (
              <li key={idx}>
                <span className="font-semibold text-slate-900">{ach.title}</span>
                {ach.organization && <span className="text-slate-700"> — {ach.organization}</span>}
                {ach.year && <span className="text-slate-500 font-mono"> ({ach.year})</span>}
                {ach.description && <span className="text-slate-600">: {ach.description}</span>}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};

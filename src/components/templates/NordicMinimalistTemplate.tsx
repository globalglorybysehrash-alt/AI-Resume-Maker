import React from 'react';
import { TemplateRenderProps, ACCENT_COLOR_MAP } from './templateTypes';
import { User, MapPin, Mail, Phone, ExternalLink } from 'lucide-react';

export const NordicMinimalistTemplate: React.FC<TemplateRenderProps> = ({
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
    density === 'compact' ? 'space-y-5' : density === 'comfortable' ? 'space-y-8' : 'space-y-6';

  return (
    <div className={`${fontClass} ${spacingClass} text-slate-800 leading-relaxed max-w-3xl mx-auto`}>
      {/* Nordic Minimalist Masthead */}
      <header className="pb-6 border-b border-slate-200/80">
        <div className="flex flex-col sm:flex-row items-baseline justify-between gap-4">
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-2 mb-2">
                <input
                  type="text"
                  value={resumeData.header.fullName}
                  onChange={(e) =>
                    setResumeData((prev) =>
                      prev ? { ...prev, header: { ...prev.header, fullName: e.target.value } } : prev
                    )
                  }
                  className="w-full text-3xl font-light text-slate-900 border-b border-slate-200 pb-1 focus:outline-none"
                />
                <input
                  type="text"
                  value={resumeData.header.headline}
                  onChange={(e) =>
                    setResumeData((prev) =>
                      prev ? { ...prev, header: { ...prev.header, headline: e.target.value } } : prev
                    )
                  }
                  className="w-full text-sm text-slate-600 border-b border-slate-100 pb-1 focus:outline-none"
                />
              </div>
            ) : (
              <div>
                <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-slate-950">
                  {resumeData.header.fullName}
                </h1>
                <p className="text-sm font-medium text-slate-500 tracking-wide mt-1">
                  {renderTextWithPlaceholderHighlight(resumeData.header.headline)}
                </p>
              </div>
            )}

            {/* Coordinates line with quiet typographic dots */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-3 font-normal">
              {resumeData.header.location && <span>{resumeData.header.location}</span>}
              {resumeData.header.email && (
                <>
                  <span className="text-slate-300" aria-hidden="true">·</span>
                  <a href={`mailto:${resumeData.header.email}`} className="hover:text-slate-900 transition-colors">
                    {resumeData.header.email}
                  </a>
                </>
              )}
              {resumeData.header.phone && (
                <>
                  <span className="text-slate-300" aria-hidden="true">·</span>
                  <span>{resumeData.header.phone}</span>
                </>
              )}
              {resumeData.header.links &&
                resumeData.header.links.map((link, idx) => (
                  <React.Fragment key={idx}>
                    <span className="text-slate-300" aria-hidden="true">·</span>
                    <a
                      href={link.startsWith('http') ? link : `https://${link}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-slate-900 transition-colors text-slate-700"
                    >
                      {link.replace(/^https?:\/\/(www\.)?/, '')}
                    </a>
                  </React.Fragment>
                ))}
            </div>
          </div>

          {showPhoto && resumeData.header.photoUrl && (
            <div className="shrink-0">
              <div className="w-20 h-24 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center shadow-xs">
                <img
                  src={resumeData.header.photoUrl}
                  alt={resumeData.header.fullName}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
        </div>
      </header>

      {/* 01. Summary */}
      <section className="print-break-inside-avoid">
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-xs font-mono font-medium text-slate-400">01</span>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Professional Profile &amp; Focus
          </h2>
        </div>
        {isEditing ? (
          <textarea
            rows={3}
            value={resumeData.summary}
            onChange={(e) =>
              setResumeData((prev) => (prev ? { ...prev, summary: e.target.value } : prev))
            }
            className="w-full p-2 text-xs border border-slate-200 rounded leading-relaxed focus:outline-none"
          />
        ) : (
          <p className="text-xs sm:text-[13px] text-slate-700 leading-relaxed pl-5 border-l border-slate-100">
            {renderTextWithPlaceholderHighlight(resumeData.summary)}
          </p>
        )}
      </section>

      {/* 02. Work Experience */}
      {resumeData.experience && resumeData.experience.length > 0 && (
        <section>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-xs font-mono font-medium text-slate-400">02</span>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Work Experience &amp; Positions
            </h2>
          </div>

          <div className="space-y-5 pl-5 border-l border-slate-100">
            {resumeData.experience.map((exp, eIdx) => (
              <div key={eIdx} className="print-break-inside-avoid space-y-1">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between">
                  <div className="text-sm">
                    <span className="font-semibold text-slate-950">{exp.role}</span>
                    <span className="text-slate-500"> — {exp.company}</span>
                  </div>
                  <div className="text-xs text-slate-400 font-mono sm:text-right">
                    <span>{exp.dates}</span>
                    {exp.location && <span> · {exp.location}</span>}
                  </div>
                </div>

                <ul className="mt-1 space-y-1 list-disc list-outside pl-4 text-xs text-slate-700 leading-relaxed">
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

      {/* 03. Core Capabilities & Skills */}
      {resumeData.skills && resumeData.skills.length > 0 && (
        <section className="print-break-inside-avoid">
          <div className="flex items-baseline gap-2 mb-2.5">
            <span className="text-xs font-mono font-medium text-slate-400">03</span>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Core Capabilities &amp; Stack
            </h2>
          </div>
          <div className="space-y-1.5 text-xs pl-5 border-l border-slate-100">
            {resumeData.skills.map((skillGroup, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                <span className="font-medium text-slate-900 sm:min-w-[130px] shrink-0">
                  {skillGroup.categoryName}:
                </span>
                <span className="text-slate-600">
                  {skillGroup.items.join(' · ')}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 04. Education */}
      {resumeData.education && resumeData.education.length > 0 && (
        <section className="print-break-inside-avoid">
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-xs font-mono font-medium text-slate-400">04</span>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Education &amp; Academic Degrees
            </h2>
          </div>
          <div className="space-y-2 text-xs pl-5 border-l border-slate-100">
            {resumeData.education.map((edu, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-baseline justify-between">
                <div>
                  <span className="font-semibold text-slate-900">{edu.degree}</span>
                  <span className="text-slate-600">, {edu.institution}</span>
                  {edu.details && <span className="text-slate-400 italic"> ({edu.details})</span>}
                </div>
                <div className="text-xs font-mono text-slate-400">{edu.dates}</div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

import React from 'react';
import { TemplateRenderProps, ACCENT_COLOR_MAP } from './templateTypes';
import { User, Sparkles, MapPin, Mail, Phone, ExternalLink } from 'lucide-react';

export const CreativeAccentTemplate: React.FC<TemplateRenderProps> = ({
  resumeData,
  setResumeData,
  isEditing,
  renderTextWithPlaceholderHighlight,
  accentColor,
  density,
  fontMode,
  showPhoto,
  onUploadPhotoClick,
}) => {
  const colors = ACCENT_COLOR_MAP[accentColor] || ACCENT_COLOR_MAP.indigo;
  const fontClass =
    fontMode === 'serif' ? 'font-serif' : fontMode === 'mono' ? 'font-mono' : 'font-sans';
  const spacingClass =
    density === 'compact' ? 'space-y-4' : density === 'comfortable' ? 'space-y-7' : 'space-y-5';

  return (
    <div className={`${fontClass} ${spacingClass} text-slate-900 leading-normal relative pl-5 sm:pl-7 border-l-4`} style={{ borderColor: colors.primary }}>
      {/* Creative Masthead */}
      <header className="pb-4 border-b border-slate-200">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="flex-1 space-y-1">
            <span
              className="text-[11px] font-bold uppercase tracking-widest block"
              style={{ color: colors.secondary }}
            >
              Creative &amp; Technical Portfolio Dossier
            </span>

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
                  className="w-full text-3xl font-extrabold border-b border-slate-300 pb-1 focus:outline-none"
                />
                <input
                  type="text"
                  value={resumeData.header.headline}
                  onChange={(e) =>
                    setResumeData((prev) =>
                      prev ? { ...prev, header: { ...prev.header, headline: e.target.value } } : prev
                    )
                  }
                  className="w-full text-sm font-semibold text-slate-700 border-b border-slate-200 pb-1 focus:outline-none"
                />
              </div>
            ) : (
              <div>
                <h1
                  className="text-3xl sm:text-4xl font-extrabold tracking-tight"
                  style={{ color: colors.primary }}
                >
                  {resumeData.header.fullName}
                </h1>
                <p className="text-sm font-bold text-slate-700 tracking-wide mt-1">
                  {renderTextWithPlaceholderHighlight(resumeData.header.headline)}
                </p>
              </div>
            )}

            {/* Coordinates line */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 pt-2 font-medium">
              {resumeData.header.location && <span>{resumeData.header.location}</span>}
              {resumeData.header.email && (
                <>
                  <span className="text-slate-300" aria-hidden="true">·</span>
                  <a href={`mailto:${resumeData.header.email}`} className="hover:underline">
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
                      className="hover:underline text-slate-900 font-semibold"
                    >
                      {link.replace(/^https?:\/\/(www\.)?/, '')}
                    </a>
                  </React.Fragment>
                ))}
            </div>
          </div>

          {showPhoto && resumeData.header.photoUrl && (
            <div className="shrink-0 flex flex-col items-center">
              <div
                className="w-24 h-28 rounded-xl overflow-hidden border-2 shadow-xs bg-slate-50 flex items-center justify-center"
                style={{ borderColor: colors.primary }}
              >
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

      {/* Summary */}
      <section className="print-break-inside-avoid">
        <h2
          className="text-xs font-bold uppercase tracking-wider pb-1 mb-2 border-b"
          style={{ color: colors.primary, borderColor: colors.primary + '30' }}
        >
          Design Philosophy &amp; Leadership Impact
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
          <p className="text-xs sm:text-[13px] text-slate-800 leading-relaxed font-normal">
            {renderTextWithPlaceholderHighlight(resumeData.summary)}
          </p>
        )}
      </section>

      {/* Skills Grouped as Modern Visual Tags */}
      {resumeData.skills && resumeData.skills.length > 0 && (
        <section className="print-break-inside-avoid">
          <h2
            className="text-xs font-bold uppercase tracking-wider pb-1 mb-3 border-b"
            style={{ color: colors.primary, borderColor: colors.primary + '30' }}
          >
            Technical &amp; Creative Domains
          </h2>
          <div className="space-y-2.5">
            {resumeData.skills.map((skillGroup, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-baseline gap-1.5 sm:gap-3 text-xs">
                <span className="font-bold text-slate-900 sm:min-w-[130px] shrink-0">
                  {skillGroup.categoryName}:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {skillGroup.items.map((item, iIdx) => (
                    <span
                      key={iIdx}
                      className="px-2.5 py-0.5 rounded-full text-xs font-medium border"
                      style={{
                        backgroundColor: colors.primary + '0c',
                        color: colors.primary,
                        borderColor: colors.primary + '25',
                      }}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Experience */}
      {resumeData.experience && resumeData.experience.length > 0 && (
        <section>
          <h2
            className="text-xs font-bold uppercase tracking-wider pb-1 mb-4 border-b"
            style={{ color: colors.primary, borderColor: colors.primary + '30' }}
          >
            Work History &amp; Key Projects
          </h2>

          <div className="space-y-5">
            {resumeData.experience.map((exp, eIdx) => (
              <div key={eIdx} className="print-break-inside-avoid">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-1">
                  <div>
                    <span className="font-bold text-sm text-slate-950">{exp.role}</span>
                    <span className="text-slate-600 text-sm font-semibold"> — {exp.company}</span>
                  </div>
                  <div className="text-xs text-slate-500 font-mono tracking-tight sm:text-right">
                    <span>{exp.dates}</span>
                    {exp.location && <span> · {exp.location}</span>}
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

      {/* Education & Honors */}
      {resumeData.education && resumeData.education.length > 0 && (
        <section className="print-break-inside-avoid">
          <h2
            className="text-xs font-bold uppercase tracking-wider pb-1 mb-2.5 border-b"
            style={{ color: colors.primary, borderColor: colors.primary + '30' }}
          >
            Academic Foundation
          </h2>
          <div className="space-y-2 text-xs">
            {resumeData.education.map((edu, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-baseline justify-between">
                <div>
                  <span className="font-bold text-slate-900">{edu.degree}</span>
                  <span className="text-slate-700">, {edu.institution}</span>
                  {edu.details && <span className="text-slate-500 italic"> ({edu.details})</span>}
                </div>
                <div className="text-xs font-mono text-slate-500">{edu.dates}</div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

import React from 'react';
import { TemplateRenderProps, ACCENT_COLOR_MAP } from './templateTypes';
import { User, Terminal, ExternalLink, Github, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

export const SiliconValleyTemplate: React.FC<TemplateRenderProps> = ({
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
  const colors = ACCENT_COLOR_MAP[accentColor] || ACCENT_COLOR_MAP.slate;

  const fontClass =
    fontMode === 'serif' ? 'font-serif' : fontMode === 'mono' ? 'font-mono' : 'font-sans';

  const spacingClass =
    density === 'compact' ? 'space-y-4' : density === 'comfortable' ? 'space-y-7' : 'space-y-5';

  return (
    <div className={`${fontClass} ${spacingClass} text-slate-900 leading-normal`}>
      {/* Silicon Valley Header */}
      <header className="border-b-2 border-slate-900 pb-4">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
          <div className="flex-1 text-center sm:text-left">
            {isEditing ? (
              <div className="space-y-2 mb-3">
                <input
                  type="text"
                  value={resumeData.header.fullName}
                  onChange={(e) =>
                    setResumeData((prev) =>
                      prev ? { ...prev, header: { ...prev.header, fullName: e.target.value } } : prev
                    )
                  }
                  className="w-full text-2xl font-bold border-b border-slate-300 pb-1 focus:outline-none"
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
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 uppercase">
                  {resumeData.header.fullName}
                </h1>
                <p className="text-sm font-semibold tracking-wide text-slate-700 mt-1">
                  {renderTextWithPlaceholderHighlight(resumeData.header.headline)}
                </p>
              </div>
            )}

            {/* Coordinates line with technical monospace labels */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1.5 text-xs text-slate-600 mt-2.5 font-mono">
              {resumeData.header.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {resumeData.header.location}
                </span>
              )}
              {resumeData.header.email && (
                <span className="flex items-center gap-1">
                  <span className="text-slate-300" aria-hidden="true">/</span>
                  <Mail className="w-3 h-3 text-slate-400" />
                  <a href={`mailto:${resumeData.header.email}`} className="hover:underline">
                    {resumeData.header.email}
                  </a>
                </span>
              )}
              {resumeData.header.phone && (
                <span className="flex items-center gap-1">
                  <span className="text-slate-300" aria-hidden="true">/</span>
                  <Phone className="w-3 h-3 text-slate-400" />
                  {resumeData.header.phone}
                </span>
              )}
              {resumeData.header.links &&
                resumeData.header.links.map((link, idx) => (
                  <span key={idx} className="flex items-center gap-1">
                    <span className="text-slate-300" aria-hidden="true">/</span>
                    <a
                      href={link.startsWith('http') ? link : `https://${link}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline text-slate-800 font-medium"
                    >
                      {link.replace(/^https?:\/\/(www\.)?/, '')}
                    </a>
                  </span>
                ))}
            </div>
          </div>

          {/* Optional Headshot (only rendered when photo is provided) */}
          {showPhoto && resumeData.header.photoUrl && (
            <div className="shrink-0 flex flex-col items-center">
              <div className="w-20 h-24 border border-slate-300 rounded overflow-hidden bg-slate-100 flex items-center justify-center shadow-xs">
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
                  className="no-print mt-1 text-[10px] text-slate-600 underline"
                >
                  Change Photo
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Summary */}
      <section className="print-break-inside-avoid">
        <div className="flex items-center gap-2 mb-2 border-b border-slate-200 pb-1">
          <span className="w-2 h-2 rounded-xs bg-slate-900" />
          <h2 className="text-xs font-bold font-mono tracking-wider uppercase text-slate-900">
            Professional Summary &amp; Architecture Focus
          </h2>
        </div>
        {isEditing ? (
          <textarea
            rows={3}
            value={resumeData.summary}
            onChange={(e) =>
              setResumeData((prev) => (prev ? { ...prev, summary: e.target.value } : prev))
            }
            className="w-full p-2 text-xs border border-slate-300 rounded leading-relaxed focus:outline-none font-sans"
          />
        ) : (
          <p className="text-xs sm:text-[13px] text-slate-800 leading-relaxed font-sans">
            {renderTextWithPlaceholderHighlight(resumeData.summary)}
          </p>
        )}
      </section>

      {/* Technical Competencies & Skills */}
      {resumeData.skills && resumeData.skills.length > 0 && (
        <section className="print-break-inside-avoid">
          <div className="flex items-center gap-2 mb-2 border-b border-slate-200 pb-1">
            <span className="w-2 h-2 rounded-xs bg-slate-900" />
            <h2 className="text-xs font-bold font-mono tracking-wider uppercase text-slate-900">
              Technical Competencies &amp; Toolchain
            </h2>
          </div>
          <div className="space-y-1.5 text-xs">
            {resumeData.skills.map((skillGroup, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                <span className="font-mono font-bold text-slate-900 sm:min-w-[140px] shrink-0 text-[11px] tracking-wide">
                  [{skillGroup.categoryName}]:
                </span>
                <span className="text-slate-800 font-sans leading-relaxed">
                  {skillGroup.items.join(' · ')}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Experience */}
      {resumeData.experience && resumeData.experience.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3 border-b border-slate-200 pb-1">
            <span className="w-2 h-2 rounded-xs bg-slate-900" />
            <h2 className="text-xs font-bold font-mono tracking-wider uppercase text-slate-900">
              Engineering &amp; Professional Experience
            </h2>
          </div>

          <div className="space-y-4 sm:space-y-5">
            {resumeData.experience.map((exp, eIdx) => (
              <div key={eIdx} className="print-break-inside-avoid border-l-2 border-slate-200 pl-3.5 ml-1">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-1">
                  <div>
                    <span className="font-bold text-sm text-slate-950 font-sans">{exp.role}</span>
                    <span className="text-slate-700 text-sm font-sans font-medium"> @ {exp.company}</span>
                  </div>
                  <div className="text-xs text-slate-500 font-mono tracking-tight sm:text-right">
                    <span>{exp.dates}</span>
                    {exp.location && <span> · {exp.location}</span>}
                  </div>
                </div>

                <ul className="mt-2 space-y-1.5 list-disc list-outside pl-3.5 text-xs text-slate-800 leading-relaxed font-sans">
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

      {/* Education */}
      {resumeData.education && resumeData.education.length > 0 && (
        <section className="print-break-inside-avoid">
          <div className="flex items-center gap-2 mb-2 border-b border-slate-200 pb-1">
            <span className="w-2 h-2 rounded-xs bg-slate-900" />
            <h2 className="text-xs font-bold font-mono tracking-wider uppercase text-slate-900">
              Education &amp; Academic Credentials
            </h2>
          </div>
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

      {/* Key Achievements & Patents */}
      {resumeData.achievements && resumeData.achievements.length > 0 && (
        <section className="print-break-inside-avoid">
          <div className="flex items-center gap-2 mb-2 border-b border-slate-200 pb-1">
            <span className="w-2 h-2 rounded-xs bg-slate-900" />
            <h2 className="text-xs font-bold font-mono tracking-wider uppercase text-slate-900">
              Key Honors, Patents &amp; Certifications
            </h2>
          </div>
          <ul className="space-y-1 text-xs text-slate-800 list-disc list-outside pl-4">
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

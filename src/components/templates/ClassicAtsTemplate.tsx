import React from 'react';
import { TemplateRenderProps, ACCENT_COLOR_MAP } from './templateTypes';
import { User } from 'lucide-react';

export const ClassicAtsTemplate: React.FC<TemplateRenderProps> = ({
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
    density === 'compact' ? 'space-y-4' : density === 'comfortable' ? 'space-y-6' : 'space-y-5';

  return (
    <div className={`${fontClass} ${spacingClass} text-slate-900 leading-normal`}>
      {/* Universal ATS Masthead */}
      <header className="text-center pb-3 border-b border-slate-300">
        {showPhoto && resumeData.header.photoUrl && (
          <div className="flex justify-center mb-3">
            <div className="w-20 h-24 rounded-lg overflow-hidden border border-slate-300 shadow-xs bg-slate-100">
              <img
                src={resumeData.header.photoUrl}
                alt={resumeData.header.fullName}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

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
              className="w-full text-center text-3xl font-bold border-b border-slate-300 pb-1 focus:outline-none"
            />
            <input
              type="text"
              value={resumeData.header.headline}
              onChange={(e) =>
                setResumeData((prev) =>
                  prev ? { ...prev, header: { ...prev.header, headline: e.target.value } } : prev
                )
              }
              className="w-full text-center text-sm font-semibold text-slate-700 border-b border-slate-200 pb-1 focus:outline-none"
            />
          </div>
        ) : (
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-950 uppercase tracking-tight">
              {resumeData.header.fullName}
            </h1>
            <p className="text-sm font-semibold text-slate-700 mt-0.5">
              {renderTextWithPlaceholderHighlight(resumeData.header.headline)}
            </p>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-xs text-slate-600 mt-2">
          {resumeData.header.location && <span>{resumeData.header.location}</span>}
          {resumeData.header.email && (
            <>
              <span className="text-slate-300" aria-hidden="true">|</span>
              <a href={`mailto:${resumeData.header.email}`} className="hover:underline">
                {resumeData.header.email}
              </a>
            </>
          )}
          {resumeData.header.phone && (
            <>
              <span className="text-slate-300" aria-hidden="true">|</span>
              <span>{resumeData.header.phone}</span>
            </>
          )}
          {resumeData.header.links &&
            resumeData.header.links.map((link, idx) => (
              <React.Fragment key={idx}>
                <span className="text-slate-300" aria-hidden="true">|</span>
                <a
                  href={link.startsWith('http') ? link : `https://${link}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline text-slate-900 font-medium"
                >
                  {link.replace(/^https?:\/\/(www\.)?/, '')}
                </a>
              </React.Fragment>
            ))}
        </div>
      </header>

      {/* Professional Summary */}
      <section className="print-break-inside-avoid">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">
          Professional Summary
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
          <p className="text-xs sm:text-[13px] text-slate-800 leading-relaxed">
            {renderTextWithPlaceholderHighlight(resumeData.summary)}
          </p>
        )}
      </section>

      {/* Skills */}
      {resumeData.skills && resumeData.skills.length > 0 && (
        <section className="print-break-inside-avoid">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">
            Core Competencies &amp; Technical Skills
          </h2>
          <div className="space-y-1.5 text-xs">
            {resumeData.skills.map((skillGroup, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                <span className="font-bold text-slate-900 sm:min-w-[130px] shrink-0">
                  {skillGroup.categoryName}:
                </span>
                <span className="text-slate-800">
                  {skillGroup.items.join(', ')}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Experience */}
      {resumeData.experience && resumeData.experience.length > 0 && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-3">
            Professional Experience
          </h2>

          <div className="space-y-4">
            {resumeData.experience.map((exp, eIdx) => (
              <div key={eIdx} className="print-break-inside-avoid">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-1">
                  <div>
                    <span className="font-bold text-sm text-slate-950">{exp.role}</span>
                    <span className="text-slate-700 text-sm font-medium"> — {exp.company}</span>
                  </div>
                  <div className="text-xs text-slate-500 font-mono tracking-tight sm:text-right">
                    <span>{exp.dates}</span>
                    {exp.location && <span> | {exp.location}</span>}
                  </div>
                </div>

                <ul className="mt-1.5 space-y-1 list-disc list-outside pl-4 text-xs text-slate-800 leading-relaxed">
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
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">
            Education &amp; Credentials
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

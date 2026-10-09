import React from 'react';
import { TemplateRenderProps, ACCENT_COLOR_MAP } from './templateTypes';
import { User } from 'lucide-react';

export const ExecutiveSerifTemplate: React.FC<TemplateRenderProps> = ({
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
  const colors = ACCENT_COLOR_MAP[accentColor] || ACCENT_COLOR_MAP.burgundy;

  const spacingClass =
    density === 'compact' ? 'space-y-4' : density === 'comfortable' ? 'space-y-7' : 'space-y-5';

  return (
    <div className={`font-serif ${spacingClass} text-slate-900 leading-relaxed`}>
      {/* Centered Aristocratic Masthead */}
      <header className="text-center pb-3">
        {showPhoto && resumeData.header.photoUrl && (
          <div className="flex justify-center mb-3">
            <div className="w-20 h-24 border border-slate-400 rounded overflow-hidden bg-slate-100 flex items-center justify-center shadow-xs">
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
              className="w-full text-center text-sm italic text-slate-700 border-b border-slate-200 pb-1 focus:outline-none"
            />
          </div>
        ) : (
          <div>
            <h1 className="text-3xl sm:text-4xl font-normal tracking-wide text-slate-950 uppercase font-serif">
              {resumeData.header.fullName}
            </h1>
            <p className="text-sm italic font-serif text-slate-700 mt-1 tracking-wide">
              {renderTextWithPlaceholderHighlight(resumeData.header.headline)}
            </p>
          </div>
        )}

        {/* Contact Coordinates */}
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-slate-700 mt-2 font-serif">
          {resumeData.header.location && <span>{resumeData.header.location}</span>}
          {resumeData.header.email && (
            <>
              <span className="text-slate-400">♦</span>
              <a href={`mailto:${resumeData.header.email}`} className="hover:underline">
                {resumeData.header.email}
              </a>
            </>
          )}
          {resumeData.header.phone && (
            <>
              <span className="text-slate-400">♦</span>
              <span>{resumeData.header.phone}</span>
            </>
          )}
          {resumeData.header.links &&
            resumeData.header.links.map((link, idx) => (
              <React.Fragment key={idx}>
                <span className="text-slate-400">♦</span>
                <a
                  href={link.startsWith('http') ? link : `https://${link}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline text-slate-800"
                >
                  {link.replace(/^https?:\/\/(www\.)?/, '')}
                </a>
              </React.Fragment>
            ))}
        </div>

        {/* Traditional Double Horizontal Rule */}
        <div className="mt-3 border-t-2 border-b border-slate-900 h-1" />
      </header>

      {/* Executive Summary */}
      <section className="print-break-inside-avoid">
        <h2 className="text-center uppercase tracking-widest text-xs font-bold text-slate-900 mb-2 border-b border-slate-300 pb-1">
          Executive Profile &amp; Leadership Mandate
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
          <p className="text-xs sm:text-[13px] text-slate-800 leading-relaxed text-justify">
            {renderTextWithPlaceholderHighlight(resumeData.summary)}
          </p>
        )}
      </section>

      {/* Education First (Traditional Ivy League & Finance standard) */}
      {resumeData.education && resumeData.education.length > 0 && (
        <section className="print-break-inside-avoid">
          <h2 className="text-center uppercase tracking-widest text-xs font-bold text-slate-900 mb-2 border-b border-slate-300 pb-1">
            Education &amp; Academic Honors
          </h2>
          <div className="space-y-2 text-xs">
            {resumeData.education.map((edu, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-baseline justify-between">
                <div>
                  <span className="font-bold text-slate-950 uppercase">{edu.institution}</span>
                  <span className="text-slate-700 italic"> — {edu.degree}</span>
                  {edu.details && <span className="text-slate-600"> ({edu.details})</span>}
                </div>
                <div className="text-xs text-slate-600 font-medium sm:text-right">{edu.dates}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Professional Experience */}
      {resumeData.experience && resumeData.experience.length > 0 && (
        <section>
          <h2 className="text-center uppercase tracking-widest text-xs font-bold text-slate-900 mb-3 border-b border-slate-300 pb-1">
            Professional Experience &amp; Transactions
          </h2>

          <div className="space-y-4">
            {resumeData.experience.map((exp, eIdx) => (
              <div key={eIdx} className="print-break-inside-avoid">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-1">
                  <div>
                    <span className="font-bold text-sm text-slate-950 uppercase">{exp.company}</span>
                    <span className="text-slate-700 text-sm italic">, {exp.role}</span>
                  </div>
                  <div className="text-xs text-slate-600 italic sm:text-right">
                    <span>{exp.dates}</span>
                    {exp.location && <span> | {exp.location}</span>}
                  </div>
                </div>

                <ul className="mt-1.5 space-y-1 list-disc list-outside pl-5 text-xs text-slate-800 leading-relaxed text-justify">
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

      {/* Core Competencies */}
      {resumeData.skills && resumeData.skills.length > 0 && (
        <section className="print-break-inside-avoid">
          <h2 className="text-center uppercase tracking-widest text-xs font-bold text-slate-900 mb-2 border-b border-slate-300 pb-1">
            Core Competencies &amp; Technical Capabilities
          </h2>
          <div className="space-y-1.5 text-xs">
            {resumeData.skills.map((skillGroup, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                <span className="font-bold text-slate-900 uppercase sm:min-w-[140px] shrink-0 text-[11px]">
                  {skillGroup.categoryName}:
                </span>
                <span className="text-slate-800 italic">
                  {skillGroup.items.join(', ')}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Honors, Governance & Certifications */}
      {resumeData.achievements && resumeData.achievements.length > 0 && (
        <section className="print-break-inside-avoid">
          <h2 className="text-center uppercase tracking-widest text-xs font-bold text-slate-900 mb-2 border-b border-slate-300 pb-1">
            Board Positions, Honors &amp; Certifications
          </h2>
          <ul className="space-y-1 text-xs text-slate-800 list-disc list-outside pl-5">
            {resumeData.achievements.map((ach, idx) => (
              <li key={idx}>
                <span className="font-bold text-slate-900">{ach.title}</span>
                {ach.organization && <span className="text-slate-700 italic"> — {ach.organization}</span>}
                {ach.year && <span className="text-slate-500"> ({ach.year})</span>}
                {ach.description && <span className="text-slate-600">: {ach.description}</span>}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};

import React from 'react';
import { TemplateRenderProps, ACCENT_COLOR_MAP } from './templateTypes';
import { User, Mail, Phone, MapPin, Globe, Linkedin, Github, Award, GraduationCap, Briefcase } from 'lucide-react';

export const ModernSplitTemplate: React.FC<TemplateRenderProps> = ({
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
  const colors = ACCENT_COLOR_MAP[accentColor] || ACCENT_COLOR_MAP.navy;

  const fontClass =
    fontMode === 'serif' ? 'font-serif' : fontMode === 'mono' ? 'font-mono' : 'font-sans';

  const spacingClass =
    density === 'compact' ? 'space-y-4' : density === 'comfortable' ? 'space-y-7' : 'space-y-5';

  return (
    <div className={`${fontClass} text-slate-900 leading-normal`}>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Column / Sidebar (35%) */}
        <aside className="md:col-span-4 bg-slate-50/90 print:bg-slate-50 border border-slate-200/80 rounded-xl p-5 sm:p-6 space-y-6">
          {/* Headshot / Photo (only if provided) */}
          {showPhoto && resumeData.header.photoUrl && (
            <div className="flex flex-col items-center pb-2">
              <div
                className="w-28 h-32 rounded-xl overflow-hidden shadow-xs border-2 flex items-center justify-center bg-white"
                style={{ borderColor: colors.primary }}
              >
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
                  className="no-print mt-2 text-[10px] text-slate-600 underline font-medium"
                >
                  Change Photo
                </button>
              )}
            </div>
          )}

          {/* Contact Details */}
          <div>
            <h3
              className="text-xs font-bold uppercase tracking-wider pb-1.5 border-b mb-3"
              style={{ color: colors.primary, borderColor: colors.primary + '40' }}
            >
              Contact Coordinates
            </h3>
            <ul className="space-y-2 text-xs text-slate-700">
              {resumeData.header.location && (
                <li className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>{resumeData.header.location}</span>
                </li>
              )}
              {resumeData.header.email && (
                <li className="flex items-start gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <a href={`mailto:${resumeData.header.email}`} className="break-all hover:underline">
                    {resumeData.header.email}
                  </a>
                </li>
              )}
              {resumeData.header.phone && (
                <li className="flex items-start gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>{resumeData.header.phone}</span>
                </li>
              )}
              {resumeData.header.links &&
                resumeData.header.links.map((link, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <a
                      href={link.startsWith('http') ? link : `https://${link}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="break-all hover:underline text-slate-900 font-medium"
                    >
                      {link.replace(/^https?:\/\/(www\.)?/, '')}
                    </a>
                  </li>
                ))}
            </ul>
          </div>

          {/* Skills Breakdown */}
          {resumeData.skills && resumeData.skills.length > 0 && (
            <div>
              <h3
                className="text-xs font-bold uppercase tracking-wider pb-1.5 border-b mb-3"
                style={{ color: colors.primary, borderColor: colors.primary + '40' }}
              >
                Core Competencies
              </h3>
              <div className="space-y-3">
                {resumeData.skills.map((skillGroup, idx) => (
                  <div key={idx} className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wide block">
                      {skillGroup.categoryName}
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {skillGroup.items.map((item, iIdx) => (
                        <span
                          key={iIdx}
                          className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-800 text-[11px] font-medium shadow-2xs"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education in Sidebar */}
          {resumeData.education && resumeData.education.length > 0 && (
            <div>
              <h3
                className="text-xs font-bold uppercase tracking-wider pb-1.5 border-b mb-3"
                style={{ color: colors.primary, borderColor: colors.primary + '40' }}
              >
                Education &amp; Degrees
              </h3>
              <div className="space-y-3 text-xs">
                {resumeData.education.map((edu, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <span className="font-bold text-slate-900 block leading-tight">{edu.degree}</span>
                    <span className="text-slate-600 block">{edu.institution}</span>
                    <div className="text-[11px] text-slate-400 font-mono">{edu.dates}</div>
                    {edu.details && (
                      <span className="text-[11px] text-slate-500 italic block">{edu.details}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Right Column / Main Body (65%) */}
        <main className={`md:col-span-8 ${spacingClass}`}>
          {/* Header Masthead */}
          <header className="border-b pb-4" style={{ borderColor: colors.primary + '30' }}>
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
                <h1
                  className="text-2xl sm:text-3xl font-extrabold tracking-tight"
                  style={{ color: colors.primary }}
                >
                  {resumeData.header.fullName}
                </h1>
                <p className="text-sm sm:text-base font-semibold text-slate-700 mt-1">
                  {renderTextWithPlaceholderHighlight(resumeData.header.headline)}
                </p>
              </div>
            )}
          </header>

          {/* Professional Summary */}
          <section className="print-break-inside-avoid">
            <h2
              className="text-xs font-bold uppercase tracking-wider pb-1 border-b mb-2"
              style={{ color: colors.primary, borderColor: colors.primary + '30' }}
            >
              Executive Summary &amp; Career Objective
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

          {/* Experience Timeline */}
          {resumeData.experience && resumeData.experience.length > 0 && (
            <section>
              <h2
                className="text-xs font-bold uppercase tracking-wider pb-1 border-b mb-4"
                style={{ color: colors.primary, borderColor: colors.primary + '30' }}
              >
                Work Experience &amp; Impact
              </h2>

              <div className="space-y-5">
                {resumeData.experience.map((exp, eIdx) => (
                  <div key={eIdx} className="print-break-inside-avoid relative pl-4 border-l-2 border-slate-200">
                    {/* Circle dot marker on timeline */}
                    <span
                      className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full"
                      style={{ backgroundColor: colors.primary }}
                    />

                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-1">
                      <div>
                        <span className="font-bold text-sm text-slate-900">{exp.role}</span>
                        <span className="text-slate-600 text-sm font-medium"> — {exp.company}</span>
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

          {/* Honors & Key Achievements */}
          {resumeData.achievements && resumeData.achievements.length > 0 && (
            <section className="print-break-inside-avoid">
              <h2
                className="text-xs font-bold uppercase tracking-wider pb-1 border-b mb-2.5"
                style={{ color: colors.primary, borderColor: colors.primary + '30' }}
              >
                Key Honors &amp; Distinctions
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
        </main>
      </div>
    </div>
  );
};

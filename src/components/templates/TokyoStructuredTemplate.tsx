import React from 'react';
import { TemplateRenderProps, ACCENT_COLOR_MAP } from './templateTypes';
import { User } from 'lucide-react';

export const TokyoStructuredTemplate: React.FC<TemplateRenderProps> = ({
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
    <div className={`${fontClass} ${spacingClass} text-slate-900 leading-normal text-xs`}>
      {/* Tokyo Hybrid Masthead */}
      <header className="border-2 border-slate-900 p-4 bg-slate-50/50">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="flex-1 space-y-1.5">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              職務経歴書 · Curriculum Vitae
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
                  className="w-full text-2xl font-bold border-b border-slate-300 pb-0.5 focus:outline-none bg-white px-1"
                />
                <input
                  type="text"
                  value={resumeData.header.headline}
                  onChange={(e) =>
                    setResumeData((prev) =>
                      prev ? { ...prev, header: { ...prev.header, headline: e.target.value } } : prev
                    )
                  }
                  className="w-full text-xs font-semibold text-slate-700 border-b border-slate-200 pb-0.5 focus:outline-none bg-white px-1"
                />
              </div>
            ) : (
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-950">
                  {resumeData.header.fullName}
                </h1>
                <p className="text-xs font-semibold text-slate-700 mt-0.5">
                  {renderTextWithPlaceholderHighlight(resumeData.header.headline)}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 pt-1 text-[11px] text-slate-600 border-t border-slate-200">
              {resumeData.header.location && (
                <div>
                  <span className="font-semibold text-slate-800">現住所 / Location: </span>
                  <span>{resumeData.header.location}</span>
                </div>
              )}
              {resumeData.header.email && (
                <div>
                  <span className="font-semibold text-slate-800">E-mail: </span>
                  <a href={`mailto:${resumeData.header.email}`} className="hover:underline">
                    {resumeData.header.email}
                  </a>
                </div>
              )}
              {resumeData.header.phone && (
                <div>
                  <span className="font-semibold text-slate-800">電話番号 / Phone: </span>
                  <span>{resumeData.header.phone}</span>
                </div>
              )}
              <div>
                <span className="font-semibold text-slate-800">在留資格 / Status: </span>
                <span>Work Visa / Permanent Resident</span>
              </div>
            </div>
          </div>

          {showPhoto && resumeData.header.photoUrl && (
            <div className="shrink-0 flex flex-col items-center">
              <div className="w-20 h-26 border border-slate-400 bg-white flex items-center justify-center overflow-hidden">
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

      {/* 職務要約 / Executive Summary */}
      <section className="border border-slate-300 rounded-xs overflow-hidden print-break-inside-avoid">
        <div className="bg-slate-100 border-b border-slate-300 px-3 py-1 font-bold text-slate-900 text-[11px] flex items-center justify-between">
          <span>職務要約 · Executive Summary</span>
          <span className="text-[10px] text-slate-500 font-normal">Career Overview</span>
        </div>
        <div className="p-3">
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
            <p className="text-xs text-slate-800 leading-relaxed">
              {renderTextWithPlaceholderHighlight(resumeData.summary)}
            </p>
          )}
        </div>
      </section>

      {/* 活かせる経験・知識・技術 / Technical Skills & Competencies */}
      {resumeData.skills && resumeData.skills.length > 0 && (
        <section className="border border-slate-300 rounded-xs overflow-hidden print-break-inside-avoid">
          <div className="bg-slate-100 border-b border-slate-300 px-3 py-1 font-bold text-slate-900 text-[11px] flex items-center justify-between">
            <span>活かせる知識・スキル · Core Skills &amp; Stack</span>
            <span className="text-[10px] text-slate-500 font-normal">Technical Strengths</span>
          </div>
          <div className="p-3 space-y-1.5">
            {resumeData.skills.map((skillGroup, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                <span className="font-bold text-slate-900 sm:min-w-[140px] shrink-0 text-[11px]">
                  ■ {skillGroup.categoryName}:
                </span>
                <span className="text-slate-800">
                  {skillGroup.items.join('、 ')}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 職務経歴 / Work Experience */}
      {resumeData.experience && resumeData.experience.length > 0 && (
        <section className="border border-slate-300 rounded-xs overflow-hidden">
          <div className="bg-slate-100 border-b border-slate-300 px-3 py-1 font-bold text-slate-900 text-[11px] flex items-center justify-between">
            <span>職務経歴詳細 · Professional Experience Details</span>
            <span className="text-[10px] text-slate-500 font-normal">Chronological History</span>
          </div>

          <div className="divide-y divide-slate-200">
            {resumeData.experience.map((exp, eIdx) => (
              <div key={eIdx} className="p-3 print-break-inside-avoid">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-1.5">
                  <div>
                    <span className="font-bold text-slate-950 text-sm">{exp.company}</span>
                    <span className="text-slate-700 font-medium"> 【{exp.role}】</span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 sm:text-right">
                    <span>期間: {exp.dates}</span>
                    {exp.location && <span> ({exp.location})</span>}
                  </div>
                </div>

                <div className="text-[11px] font-semibold text-slate-600 mb-1">【担当業務 &amp; 実績 / Achievements】</div>
                <ul className="space-y-1 list-disc list-outside pl-4 text-slate-800 leading-relaxed">
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

      {/* 学歴 / Education */}
      {resumeData.education && resumeData.education.length > 0 && (
        <section className="border border-slate-300 rounded-xs overflow-hidden print-break-inside-avoid">
          <div className="bg-slate-100 border-b border-slate-300 px-3 py-1 font-bold text-slate-900 text-[11px] flex items-center justify-between">
            <span>学歴 · Education</span>
            <span className="text-[10px] text-slate-500 font-normal">Degrees</span>
          </div>
          <div className="p-3 space-y-1.5">
            {resumeData.education.map((edu, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-baseline justify-between">
                <div>
                  <span className="font-bold text-slate-900">{edu.institution}</span>
                  <span className="text-slate-700"> {edu.degree}</span>
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

import React from 'react';
import { TemplateRenderProps, ACCENT_COLOR_MAP } from './templateTypes';
import { User, MapPin, Mail, Phone, Calendar, Flag } from 'lucide-react';

export const DachLebenslaufTemplate: React.FC<TemplateRenderProps> = ({
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
      {/* German Lebenslauf DIN 5008 Masthead */}
      <header className="border-b-2 border-slate-900 pb-5">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
          {/* Left: Candidate Details & Formal German Metadata */}
          <div className="flex-1 space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500 block">
              Curriculum Vitae · Lebenslauf
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
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950">
                  {resumeData.header.fullName}
                </h1>
                <p className="text-sm font-semibold text-slate-700 mt-0.5">
                  {renderTextWithPlaceholderHighlight(resumeData.header.headline)}
                </p>
              </div>
            )}

            {/* German Standard Personal Data Table */}
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-700">
              {resumeData.header.location && (
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-900 min-w-[90px]">Wohnort:</span>
                  <span>{resumeData.header.location}</span>
                </div>
              )}
              {resumeData.header.email && (
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-900 min-w-[90px]">E-Mail:</span>
                  <a href={`mailto:${resumeData.header.email}`} className="hover:underline">
                    {resumeData.header.email}
                  </a>
                </div>
              )}
              {resumeData.header.phone && (
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-900 min-w-[90px]">Telefon:</span>
                  <span>{resumeData.header.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-900 min-w-[90px]">Arbeitsstatus:</span>
                <span>EU-Arbeitserlaubnis / Unbefristet</span>
              </div>
            </div>
          </div>

          {/* Right: Formal German Bewerbungsfoto Frame (only if photo provided) */}
          {showPhoto && resumeData.header.photoUrl && (
            <div className="shrink-0 flex flex-col items-center">
              <div className="w-24 h-32 border-2 border-slate-300 rounded-sm overflow-hidden bg-slate-100 flex items-center justify-center shadow-xs">
                <img
                  src={resumeData.header.photoUrl}
                  alt="Bewerbungsfoto"
                  className="w-full h-full object-cover"
                />
              </div>
              {isEditing && onUploadPhotoClick && (
                <button
                  type="button"
                  onClick={onUploadPhotoClick}
                  className="no-print mt-1.5 text-[10px] text-slate-600 underline font-medium"
                >
                  Foto ändern
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Kurzprofil / Zusammenfassung */}
      <section className="print-break-inside-avoid">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-900 pb-1 mb-2">
          Kurzprofil &amp; Qualifikationsschwerpunkte
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

      {/* Beruflicher Werdegang (Chronological Tabular Layout) */}
      {resumeData.experience && resumeData.experience.length > 0 && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-900 pb-1 mb-3">
            Beruflicher Werdegang
          </h2>

          <div className="space-y-4">
            {resumeData.experience.map((exp, eIdx) => (
              <div key={eIdx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 print-break-inside-avoid">
                {/* Left Date Column */}
                <div className="sm:col-span-3 text-xs font-medium text-slate-600 sm:pt-0.5">
                  <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[11px] block sm:inline-block">
                    {exp.dates}
                  </span>
                  {exp.location && (
                    <span className="block text-[11px] text-slate-500 mt-0.5">{exp.location}</span>
                  )}
                </div>

                {/* Right Description Column */}
                <div className="sm:col-span-9 pl-0 sm:pl-3 sm:border-l border-slate-200">
                  <div className="font-bold text-sm text-slate-950">
                    {exp.role} <span className="font-medium text-slate-700">| {exp.company}</span>
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
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Ausbildung & Studium */}
      {resumeData.education && resumeData.education.length > 0 && (
        <section className="print-break-inside-avoid">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-900 pb-1 mb-3">
            Ausbildung &amp; Akademischer Werdegang
          </h2>

          <div className="space-y-3">
            {resumeData.education.map((edu, idx) => (
              <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                <div className="sm:col-span-3 text-xs font-mono text-slate-500">
                  <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[11px] block sm:inline-block">
                    {edu.dates}
                  </span>
                </div>
                <div className="sm:col-span-9 pl-0 sm:pl-3 sm:border-l border-slate-200 text-xs">
                  <span className="font-bold text-slate-950 block">{edu.degree}</span>
                  <span className="text-slate-700 block">{edu.institution}</span>
                  {edu.details && <span className="text-slate-500 italic block mt-0.5">{edu.details}</span>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Kenntnisse & Kernkompetenzen */}
      {resumeData.skills && resumeData.skills.length > 0 && (
        <section className="print-break-inside-avoid">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-900 pb-1 mb-2.5">
            Kenntnisse, IT-Kompetenzen &amp; Sprachen
          </h2>
          <div className="space-y-1.5 text-xs">
            {resumeData.skills.map((skillGroup, idx) => (
              <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                <span className="sm:col-span-3 font-semibold text-slate-900">
                  {skillGroup.categoryName}:
                </span>
                <span className="sm:col-span-9 text-slate-800">
                  {skillGroup.items.join(', ')}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Formal German Place, Date, & Signature Block (DIN 5008 Requirement) */}
      <footer className="pt-6 mt-8 border-t border-slate-200 print-break-inside-avoid">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 text-xs text-slate-700">
          <div>
            <span>
              {resumeData.header.location || 'Berlin'}, den {new Date().toLocaleDateString('de-DE')}
            </span>
          </div>
          <div className="border-t border-slate-600 w-52 pt-1 text-center font-serif italic text-slate-800">
            {resumeData.header.fullName} (Unterschrift)
          </div>
        </div>
      </footer>
    </div>
  );
};

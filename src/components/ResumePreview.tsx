import React, { useState, useEffect } from 'react';
import { GeneratedResumeData, TemplateLayoutStyle, ResumeTemplateMeta } from '../types/resume';
import { exportElementToPdf } from '../lib/pdfExport';
import { TOP_50_GLOBAL_TEMPLATES } from '../data/templates50Data';
import { DynamicTemplateRenderer } from './templates/DynamicTemplateRenderer';
import { AccentColor, SpacingDensity, FontMode } from './templates/templateTypes';
import {
  Printer,
  Copy,
  Check,
  Edit3,
  Eye,
  Download,
  FileDown,
  Info,
  Cloud,
  Loader2,
  Globe2,
  Layers,
  Palette,
  Type,
  Maximize2,
  Camera,
  X,
  Sparkles,
  UploadCloud,
  Trash2,
  Image as ImageIcon,
} from 'lucide-react';

interface ResumePreviewProps {
  resumeData: GeneratedResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<GeneratedResumeData | null>>;
  onPrint: () => void;
  onSaveToCloud?: () => void;
  activeTemplateId?: string;
  onSelectTemplate?: (template: ResumeTemplateMeta) => void;
  onOpenTemplatesHub?: () => void;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({
  resumeData,
  setResumeData,
  onPrint,
  onSaveToCloud,
  activeTemplateId = 'us-silicon-valley-ats',
  onSelectTemplate,
  onOpenTemplatesHub,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState(false);
  const [photoUrlInput, setPhotoUrlInput] = useState(resumeData.header.photoUrl || '');
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);

  // Active template metadata
  const currentTemplate =
    TOP_50_GLOBAL_TEMPLATES.find((t) => t.id === activeTemplateId) ||
    TOP_50_GLOBAL_TEMPLATES[0];

  // Visual styling customization state
  const [activeLayoutStyle, setActiveLayoutStyle] = useState<TemplateLayoutStyle>(
    currentTemplate.layoutStyle || 'classic-ats'
  );

  const [accentColor, setAccentColor] = useState<AccentColor>(() => {
    if (currentTemplate.layoutStyle === 'dubai-executive') return 'navy';
    if (currentTemplate.layoutStyle === 'executive-serif') return 'burgundy';
    if (currentTemplate.layoutStyle === 'creative-accent') return 'indigo';
    return 'slate';
  });

  const [density, setDensity] = useState<SpacingDensity>('standard');

  const [fontMode, setFontMode] = useState<FontMode>(() => {
    if (currentTemplate.layoutStyle === 'executive-serif') return 'serif';
    return 'sans';
  });

  const [photoEnabled, setPhotoEnabled] = useState<boolean>(() => {
    return Boolean(resumeData.header.photoUrl);
  });

  // Keep in sync when template changes or photoUrl updates
  useEffect(() => {
    setActiveLayoutStyle(currentTemplate.layoutStyle || 'classic-ats');
    if (currentTemplate.layoutStyle === 'executive-serif') {
      setFontMode('serif');
      setAccentColor('burgundy');
    } else if (currentTemplate.layoutStyle === 'dubai-executive') {
      setFontMode('sans');
      setAccentColor('navy');
    } else if (currentTemplate.layoutStyle === 'creative-accent') {
      setFontMode('sans');
      setAccentColor('indigo');
    } else {
      setFontMode('sans');
    }

    setPhotoEnabled(Boolean(resumeData.header.photoUrl));
  }, [currentTemplate.id, resumeData.header.photoUrl]);

  const isGermanDach =
    currentTemplate.country.toLowerCase().includes('germany') ||
    activeLayoutStyle === 'dach-lebenslauf';

  const isAussieOrUk =
    currentTemplate.country.toLowerCase().includes('australia') ||
    currentTemplate.country.toLowerCase().includes('united kingdom');

  // Direct PDF Download using jsPDF + html2canvas
  const handleDownloadPdf = async () => {
    setIsExportingPdf(true);
    try {
      const sanitizedName = resumeData.header.fullName.trim().replace(/\s+/g, '_') || 'Resume';
      await exportElementToPdf('resume-document-sheet', {
        filename: `${sanitizedName}_${currentTemplate.countryCode}_${activeLayoutStyle}_Resume.pdf`,
        format: 'letter',
        marginMm: 8,
      });
      setPdfSuccess(true);
      setTimeout(() => setPdfSuccess(false), 2500);
    } catch (err) {
      console.error('Failed to export PDF directly:', err);
      onPrint();
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Copy plain text representation
  const handleCopyText = async () => {
    let plain = `${resumeData.header.fullName}\n${resumeData.header.headline}\n`;
    plain += `${resumeData.header.email} | ${resumeData.header.phone} | ${resumeData.header.location}\n`;
    if (resumeData.header.links.length > 0) {
      plain += `${resumeData.header.links.join(' | ')}\n`;
    }
    plain += `\nPROFESSIONAL SUMMARY\n${resumeData.summary}\n\n`;

    plain += `CORE COMPETENCIES & SKILLS\n`;
    resumeData.skills.forEach((s) => {
      plain += `${s.categoryName}: ${s.items.join(', ')}\n`;
    });
    plain += `\n`;

    plain += `EXPERIENCE\n`;
    resumeData.experience.forEach((e) => {
      plain += `${e.role} - ${e.company}, ${e.location} (${e.dates})\n`;
      e.bullets.forEach((b) => {
        plain += `• ${b}\n`;
      });
      plain += `\n`;
    });

    plain += `EDUCATION\n`;
    resumeData.education.forEach((edu) => {
      plain += `${edu.degree}, ${edu.institution} (${edu.dates})\n`;
      if (edu.details) plain += `${edu.details}\n`;
    });

    await navigator.clipboard.writeText(plain);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Backup JSON
  const handleDownloadJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(resumeData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${resumeData.header.fullName.replace(/\s+/g, '_')}_Resume.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Helper for highlights: detect bracketed placeholders like [Add metric]
  const renderTextWithPlaceholderHighlight = (text: string) => {
    const parts = text.split(/(\[[^\]]+\])/g);
    return parts.map((part, i) => {
      if (part.startsWith('[') && part.endsWith(']')) {
        return (
          <span
            key={i}
            className="inline-block bg-amber-100 text-amber-900 border border-amber-300 rounded px-1.5 py-0.5 text-xs font-semibold print:bg-transparent print:border-none print:text-black print:p-0"
            title="Placeholder: Click 'Edit Document' above to fill this in with your factual details"
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  // Construct active template metadata reflecting layout overrides
  const effectiveTemplateMeta: ResumeTemplateMeta = {
    ...currentTemplate,
    layoutStyle: activeLayoutStyle,
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Template Switcher Bar */}
      <div className="no-print mb-4 p-4 bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl" role="img" aria-label={currentTemplate.country}>
            {currentTemplate.flag}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900">{currentTemplate.name}</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-semibold text-slate-700">
                {currentTemplate.recommendedPages}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Format: {currentTemplate.countrySpecs.formatName} · Photo: {currentTemplate.photoRule}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenTemplatesHub && (
            <button
              type="button"
              onClick={onOpenTemplatesHub}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
            >
              <Globe2 className="w-3.5 h-3.5 text-slate-600" />
              <span>Browse All 50 Country Standards</span>
            </button>
          )}

          {/* Quick Switch Dropdown */}
          {onSelectTemplate && (
            <select
              value={currentTemplate.id}
              onChange={(e) => {
                const found = TOP_50_GLOBAL_TEMPLATES.find((t) => t.id === e.target.value);
                if (found) onSelectTemplate(found);
              }}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              {TOP_50_GLOBAL_TEMPLATES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.flag} {t.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* State-of-the-Art Visual & Layout Styling Toolbar (No-Print) */}
      <div className="no-print mb-4 p-4 bg-slate-900 text-white rounded-xl shadow-md space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
            <Palette className="w-3.5 h-3.5" />
            <span>State-of-the-Art Visual &amp; Layout Styling Engine</span>
          </div>
          <span className="text-[11px] text-slate-400">
            Interactive Live Styler
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
          {/* 1. Layout Style Switcher */}
          <div className="sm:col-span-5 space-y-1">
            <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
              <Layers className="w-3 h-3 text-slate-400" />
              <span>Layout Architecture:</span>
            </label>
            <select
              value={activeLayoutStyle}
              onChange={(e) => setActiveLayoutStyle(e.target.value as TemplateLayoutStyle)}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-emerald-400 font-medium"
            >
              <option value="silicon-valley">Silicon Valley Tech ATS (Single Column)</option>
              <option value="modern-split">Modern Two-Column Split (Magazine Sidebar)</option>
              <option value="executive-serif">Executive Serif (Wall Street &amp; Ivy League)</option>
              <option value="dach-lebenslauf">DACH DIN 5008 Lebenslauf (German Tabular)</option>
              <option value="dubai-executive">Dubai &amp; GCC Executive Gold (Luxury Navy)</option>
              <option value="nordic-minimalist">Nordic Minimalist (Airy Scandinavian)</option>
              <option value="tokyo-structured">Tokyo Structured (Japanese Grid Bilingual)</option>
              <option value="creative-accent">Creative Accent (Designer Spine &amp; Tags)</option>
              <option value="classic-ats">Classic ATS (100/100 Machine Parser)</option>
            </select>
          </div>

          {/* 2. Color Palette */}
          <div className="sm:col-span-3 space-y-1">
            <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
              <Palette className="w-3 h-3 text-slate-400" />
              <span>Color Theme:</span>
            </label>
            <div className="flex items-center gap-1.5 pt-0.5">
              {[
                { id: 'slate', name: 'Slate', color: '#0f172a' },
                { id: 'navy', name: 'Navy', color: '#0f2744' },
                { id: 'emerald', name: 'Emerald', color: '#064e3b' },
                { id: 'indigo', name: 'Indigo', color: '#312e81' },
                { id: 'burgundy', name: 'Burgundy', color: '#4c0519' },
                { id: 'gold', name: 'Gold', color: '#78350f' },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setAccentColor(c.id as AccentColor)}
                  style={{ backgroundColor: c.color }}
                  className={`w-6 h-6 rounded-full border-2 transition-transform ${
                    accentColor === c.id
                      ? 'scale-110 border-white ring-2 ring-emerald-400'
                      : 'border-slate-700 hover:scale-105'
                  }`}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          {/* 3. Typography Mode */}
          <div className="sm:col-span-2 space-y-1">
            <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
              <Type className="w-3 h-3 text-slate-400" />
              <span>Font:</span>
            </label>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setFontMode('sans')}
                className={`px-2 py-1 rounded text-xs font-sans font-medium transition-colors ${
                  fontMode === 'sans' ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Sans
              </button>
              <button
                type="button"
                onClick={() => setFontMode('serif')}
                className={`px-2 py-1 rounded text-xs font-serif font-medium transition-colors ${
                  fontMode === 'serif' ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Serif
              </button>
              <button
                type="button"
                onClick={() => setFontMode('mono')}
                className={`px-2 py-1 rounded text-xs font-mono font-medium transition-colors ${
                  fontMode === 'mono' ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Mono
              </button>
            </div>
          </div>

          {/* 4. Density & Photo */}
          <div className="sm:col-span-2 space-y-1">
            <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
              <Maximize2 className="w-3 h-3 text-slate-400" />
              <span>Density:</span>
            </label>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setDensity('compact')}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                  density === 'compact' ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
                title="Compact 1-Page fit"
              >
                1-Page
              </button>
              <button
                type="button"
                onClick={() => setDensity('standard')}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                  density === 'standard' ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Normal
              </button>
              <button
                type="button"
                onClick={() => setShowPhotoUpload(true)}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all flex items-center gap-1.5 ${
                  resumeData.header.photoUrl
                    ? photoEnabled
                      ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                      : 'bg-slate-700 text-amber-200 hover:bg-slate-600'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
                title="Add or manage profile photo on CV"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>
                  {resumeData.header.photoUrl
                    ? photoEnabled
                      ? 'Photo: On'
                      : 'Photo: Off'
                    : '+ Add Photo'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* State-of-the-Art Profile Photo Manager Modal */}
        {showPhotoUpload && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 text-white shadow-2xl space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Camera className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Profile Photo / Headshot</h3>
                    <p className="text-[11px] text-slate-400">Optional for all templates</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPhotoUpload(false)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Current Photo Status & Preview */}
              {resumeData.header.photoUrl ? (
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-emerald-400 shadow-xs bg-slate-950 shrink-0">
                      <img
                        src={resumeData.header.photoUrl}
                        alt="Current CV Headshot"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-white block">Photo Attached</span>
                      <span className="text-[11px] text-slate-400 block">
                        Status on CV: {photoEnabled ? 'Visible' : 'Hidden'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 items-end">
                    <button
                      type="button"
                      onClick={() => setPhotoEnabled(!photoEnabled)}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded transition-colors ${
                        photoEnabled
                          ? 'bg-amber-400 text-slate-950 hover:bg-amber-300'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      {photoEnabled ? 'Hide on CV' : 'Show on CV'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setResumeData((prev) =>
                          prev ? { ...prev, header: { ...prev.header, photoUrl: '' } } : prev
                        );
                        setPhotoUrlInput('');
                        setPhotoEnabled(false);
                      }}
                      className="text-[10px] text-rose-400 hover:text-rose-300 flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove Photo</span>
                    </button>
                  </div>
                </div>
              ) : null}

              {/* Upload New Photo Section */}
              <div className="space-y-3 pt-1">
                <span className="text-xs font-semibold text-slate-300 block">
                  {resumeData.header.photoUrl ? 'Replace Photo:' : 'Choose Photo:'}
                </span>

                <div className="flex flex-wrap items-center gap-2">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-xs transition-colors">
                    <UploadCloud className="w-4 h-4" />
                    <span>Upload Image File</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/jpg"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = () => {
                            if (typeof reader.result === 'string') {
                              setPhotoUrlInput(reader.result);
                              setResumeData((prev) =>
                                prev ? { ...prev, header: { ...prev.header, photoUrl: reader.result as string } } : prev
                              );
                              setPhotoEnabled(true);
                              setShowPhotoUpload(false);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[11px] text-slate-400">Supports PNG, JPG, WEBP</span>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 block">Or enter image web URL:</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      placeholder="https://example.com/photo.jpg"
                      value={photoUrlInput}
                      onChange={(e) => setPhotoUrlInput(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (photoUrlInput.trim()) {
                          setResumeData((prev) =>
                            prev ? { ...prev, header: { ...prev.header, photoUrl: photoUrlInput.trim() } } : prev
                          );
                          setPhotoEnabled(true);
                          setShowPhotoUpload(false);
                        }
                      }}
                      disabled={!photoUrlInput.trim()}
                      className="px-3.5 py-1.5 text-xs font-bold text-slate-900 bg-emerald-400 hover:bg-emerald-300 disabled:bg-slate-700 disabled:text-slate-500 rounded-lg transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>

              {/* International Norms Info */}
              <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60 text-[11px] text-slate-400 leading-relaxed">
                <span className="text-slate-200 font-semibold block mb-0.5">International Guidelines:</span>
                Headshots are customary in Germany (Bewerbungsfoto), France, Japan, and the UAE. In the US, UK, and Canada, they are typically omitted to maintain ATS compliance.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Top Action Toolbar (Hidden when printing) */}
      <div className="no-print mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">Curated Resume Document</h2>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
            <span>Fact-Verified</span>
            <span aria-hidden="true">·</span>
            <span>{currentTemplate.country} Standards</span>
            <span aria-hidden="true">·</span>
            <span>Style: {activeLayoutStyle}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              isEditing
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            {isEditing ? <Eye className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
            <span>{isEditing ? 'Preview Mode' : 'Edit Document'}</span>
          </button>

          <button
            type="button"
            onClick={handleCopyText}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors"
            title="Copy formatted plain text to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Plaintext'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadJson}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors"
            title="Download JSON backup"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Backup JSON</span>
          </button>

          {onSaveToCloud && (
            <button
              type="button"
              onClick={onSaveToCloud}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
              title="Save this resume securely to Cloud Firestore"
            >
              <Cloud className="w-3.5 h-3.5 text-emerald-600" />
              <span>Save to Cloud</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isExportingPdf}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 rounded-lg transition-colors shadow-xs"
            title="Download resume directly as a PDF file"
          >
            {isExportingPdf ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Exporting PDF...</span>
              </>
            ) : pdfSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Downloaded!</span>
              </>
            ) : (
              <>
                <FileDown className="w-3.5 h-3.5 text-emerald-300" />
                <span>Download PDF</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onPrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors"
            title="Open browser print dialogue (Save as PDF)"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Placeholders Notice (Hidden during print) */}
      <div className="no-print mb-6 p-3.5 rounded-lg border border-amber-200 bg-amber-50/70 text-amber-900 text-xs flex items-start gap-2.5">
        <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-semibold">Review Highlighted Placeholders:</span> Any bracketed text like{' '}
          <code className="bg-amber-100 px-1 py-0.5 rounded text-[11px] font-mono">[Add metric]</code> marks areas
          where no metrics were found in your draft. We never fabricate numbers. You can click{' '}
          <strong>Edit Document</strong> to substitute your real impact before printing.
        </div>
      </div>

      {/* Main Resume Sheet */}
      <article
        id="resume-document-sheet"
        className="print-container bg-white border border-slate-200/90 shadow-xl shadow-slate-200/60 rounded-2xl p-8 sm:p-12 text-slate-900 max-w-[850px] mx-auto transition-all"
      >
        {/* Dynamic Template Dispatcher */}
        <DynamicTemplateRenderer
          resumeData={resumeData}
          setResumeData={setResumeData}
          isEditing={isEditing}
          renderTextWithPlaceholderHighlight={renderTextWithPlaceholderHighlight}
          templateMeta={effectiveTemplateMeta}
          accentColor={accentColor}
          density={density}
          fontMode={fontMode}
          showPhoto={photoEnabled}
          onUploadPhotoClick={() => setShowPhotoUpload(true)}
        />

        {/* Australia / UK Referees Clause (if not already handled in specialized template) */}
        {isAussieOrUk && activeLayoutStyle !== 'dach-lebenslauf' && (
          <section className="mt-6 pt-3 border-t border-slate-100 print-break-inside-avoid text-xs text-slate-600">
            <span className="font-semibold text-slate-800">Referees: </span>
            <span>Professional reference contacts available immediately upon request.</span>
          </section>
        )}

        {/* Footer Disclaimer for Transparency */}
        <footer className="mt-8 pt-4 border-t border-slate-100 text-[10px] text-slate-400 text-center leading-normal">
          Book Kaaro Studio · Standardized for {currentTemplate.country} ({currentTemplate.countrySpecs.formatName}) · Layout: {activeLayoutStyle} · Fact-Verified
        </footer>
      </article>
    </div>
  );
};

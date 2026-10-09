import React, { useState } from 'react';
import { GeneratedCoverLetterData, ResumeTemplateMeta } from '../types/resume';
import { exportElementToPdf } from '../lib/pdfExport';
import { TOP_50_GLOBAL_TEMPLATES } from '../data/templates50Data';
import { Printer, Copy, Check, Edit3, Eye, Download, FileDown, Info, Loader2 } from 'lucide-react';

interface CoverLetterPreviewProps {
  coverLetterData: GeneratedCoverLetterData;
  setCoverLetterData: React.Dispatch<React.SetStateAction<GeneratedCoverLetterData | null>>;
  onPrint: () => void;
  activeTemplateId?: string;
}

export const CoverLetterPreview: React.FC<CoverLetterPreviewProps> = ({
  coverLetterData,
  setCoverLetterData,
  onPrint,
  activeTemplateId = 'us-silicon-valley-ats',
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState(false);

  const currentTemplate =
    TOP_50_GLOBAL_TEMPLATES.find((t) => t.id === activeTemplateId) ||
    TOP_50_GLOBAL_TEMPLATES[0];

  const handleDownloadPdf = async () => {
    setIsExportingPdf(true);
    try {
      const sanitizedName = coverLetterData.senderInfo.fullName.trim().replace(/\s+/g, '_') || 'CoverLetter';
      await exportElementToPdf('cover-letter-sheet', {
        filename: `${sanitizedName}_${currentTemplate.countryCode}_Cover_Letter.pdf`,
        format: 'letter',
        marginMm: 10,
      });
      setPdfSuccess(true);
      setTimeout(() => setPdfSuccess(false), 2500);
    } catch (err) {
      console.error('Failed to export Cover Letter PDF:', err);
      onPrint();
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleCopyText = async () => {
    let plain = `${coverLetterData.senderInfo.fullName}\n`;
    plain += `${coverLetterData.senderInfo.email} | ${coverLetterData.senderInfo.phone} | ${coverLetterData.senderInfo.location}\n\n`;
    plain += `${coverLetterData.date}\n\n`;
    plain += `${coverLetterData.recipientInfo.managerName}\n`;
    plain += `${coverLetterData.recipientInfo.companyName}\n`;
    plain += `Re: Application for ${coverLetterData.recipientInfo.roleTitle}\n\n`;
    plain += `${coverLetterData.salutation}\n\n`;
    plain += `${coverLetterData.openingParagraph}\n\n`;
    coverLetterData.bodyParagraphs.forEach((p) => {
      plain += `${p}\n\n`;
    });
    plain += `${coverLetterData.closingParagraph}\n\n`;
    plain += `${coverLetterData.signoff}\n`;
    plain += `${coverLetterData.senderInfo.fullName}\n`;

    try {
      await navigator.clipboard.writeText(plain);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const renderPlaceholder = (text: string) => {
    const parts = text.split(/(\[[^\]]+\])/g);
    return parts.map((part, i) => {
      if (part.startsWith('[') && part.endsWith(']')) {
        return (
          <span
            key={i}
            className="inline-block bg-amber-100 text-amber-900 border border-amber-300 rounded px-1.5 py-0.5 text-xs font-semibold print:bg-transparent print:border-none print:text-black print:p-0"
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Action Toolbar */}
      <div className="no-print mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">Matching Cover Letter</h2>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
            <span>Role-Tailored</span>
            <span aria-hidden="true">·</span>
            <span>Fact-Aligned</span>
            <span aria-hidden="true">·</span>
            <span>Direct Letterhead</span>
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
            <span>{isEditing ? 'Preview Mode' : 'Edit Letter'}</span>
          </button>

          <button
            type="button"
            onClick={handleCopyText}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Text'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isExportingPdf}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 rounded-lg transition-colors shadow-xs"
            title="Download cover letter directly as a PDF file"
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

      <div className="no-print mb-6 p-3.5 rounded-lg border border-amber-200 bg-amber-50/70 text-amber-900 text-xs flex items-start gap-2.5">
        <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-semibold">Ethical Career Disclosure:</span> This letter strictly maps your actual
          verified experience to the target requirements without fabricating prior relationships or skills.
          Adjust the recipient name if known.
        </div>
      </div>

      {/* Main Cover Letter Document Sheet */}
      <article
        id="cover-letter-sheet"
        className={`print-container bg-white border border-slate-200 shadow-sm rounded-xl p-8 sm:p-14 text-slate-900 leading-relaxed font-normal ${
          currentTemplate.layoutStyle === 'executive-serif' ? 'font-serif' : 'font-sans'
        }`}
      >
        {/* Letterhead */}
        <header className="border-b border-slate-200 pb-5 mb-8">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-950">
            {coverLetterData.senderInfo.fullName}
          </h1>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 mt-2 font-normal">
            <span>{coverLetterData.senderInfo.location}</span>
            <span className="text-slate-300 print:text-slate-400">·</span>
            <span>{coverLetterData.senderInfo.email}</span>
            <span className="text-slate-300 print:text-slate-400">·</span>
            <span>{coverLetterData.senderInfo.phone}</span>
          </div>
        </header>

        {/* Date & Recipient Details */}
        <div className="mb-6 text-xs sm:text-sm text-slate-700 space-y-1">
          <p className="font-mono text-slate-500 mb-4">{coverLetterData.date}</p>
          <p className="font-semibold text-slate-900">
            {renderPlaceholder(coverLetterData.recipientInfo.managerName)}
          </p>
          <p>{renderPlaceholder(coverLetterData.recipientInfo.companyName)}</p>
          <p className="font-medium text-slate-800 mt-2">
            Re: Application for {renderPlaceholder(coverLetterData.recipientInfo.roleTitle)}
          </p>
        </div>

        {/* Salutation */}
        <div className="mb-4 text-sm font-semibold text-slate-900">
          {renderPlaceholder(coverLetterData.salutation)}
        </div>

        {/* Letter Body */}
        <div className="space-y-4 text-xs sm:text-sm text-slate-800 leading-relaxed">
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Opening Paragraph</label>
                <textarea
                  rows={3}
                  value={coverLetterData.openingParagraph}
                  onChange={(e) =>
                    setCoverLetterData((prev) =>
                      prev ? { ...prev, openingParagraph: e.target.value } : prev
                    )
                  }
                  className="w-full p-2 text-xs border border-slate-300 rounded"
                />
              </div>

              {coverLetterData.bodyParagraphs.map((bodyP, idx) => (
                <div key={idx}>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Body Paragraph #{idx + 1}
                  </label>
                  <textarea
                    rows={4}
                    value={bodyP}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCoverLetterData((prev) => {
                        if (!prev) return prev;
                        const updated = [...prev.bodyParagraphs];
                        updated[idx] = val;
                        return { ...prev, bodyParagraphs: updated };
                      });
                    }}
                    className="w-full p-2 text-xs border border-slate-300 rounded"
                  />
                </div>
              ))}

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Closing Paragraph</label>
                <textarea
                  rows={3}
                  value={coverLetterData.closingParagraph}
                  onChange={(e) =>
                    setCoverLetterData((prev) =>
                      prev ? { ...prev, closingParagraph: e.target.value } : prev
                    )
                  }
                  className="w-full p-2 text-xs border border-slate-300 rounded"
                />
              </div>
            </div>
          ) : (
            <>
              <p>{renderPlaceholder(coverLetterData.openingParagraph)}</p>
              {coverLetterData.bodyParagraphs.map((paragraph, idx) => (
                <p key={idx}>{renderPlaceholder(paragraph)}</p>
              ))}
              <p>{renderPlaceholder(coverLetterData.closingParagraph)}</p>
            </>
          )}
        </div>

        {/* Signoff */}
        <div className="mt-8 pt-4 space-y-4 text-xs sm:text-sm text-slate-800">
          <p>{coverLetterData.signoff},</p>
          <div className="pt-2">
            <p className="font-bold text-slate-950">{coverLetterData.senderInfo.fullName}</p>
          </div>
        </div>
      </article>
    </div>
  );
};

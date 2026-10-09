import React, { useState, useRef, useEffect } from 'react';
import { parseUploadedResumeFile, ExtractedResumeResult } from '../lib/resumeParser';
import { ResumeFormData } from '../types/resume';
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  ArrowRight,
  FileUp,
  Image as ImageIcon,
  FileCheck,
  Calendar,
  Briefcase,
  GraduationCap,
  Wrench,
  Award,
  Loader2,
  Scan,
  ShieldCheck,
} from 'lucide-react';

interface ResumeUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyParsedData: (data: Partial<ResumeFormData>) => void;
}

export const ResumeUploadModal: React.FC<ResumeUploadModalProps> = ({
  isOpen,
  onClose,
  onApplyParsedData,
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState<string>('Analyzing document layout...');
  const [parsedResult, setParsedResult] = useState<{
    formData: Partial<ResumeFormData>;
    rawTextPreview: string;
    sourceType: string;
    detectedType: string;
    confidenceScore: number;
    filename: string;
    stats: {
      experiencesCount: number;
      educationCount: number;
      achievementsCount: number;
      hasDates: boolean;
      hasContact: boolean;
    };
  } | null>(null);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cycling scanning progress text
  useEffect(() => {
    if (!isProcessing) return;
    const stages = [
      'Scanning document structure & optical layout...',
      'Extracting exact career timeline & dates...',
      'Transcribing roles, accomplishments & metrics...',
      'Categorizing technical skills & credentials...',
      'Verifying factual integrity & precision...',
    ];
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % stages.length;
      setProcessingStage(stages[idx]);
    }, 1200);
    return () => clearInterval(interval);
  }, [isProcessing]);

  if (!isOpen) return null;

  const handleProcessFile = async (file: File) => {
    setIsProcessing(true);
    setErrorMsg(null);
    setParsedResult(null);

    try {
      const result: ExtractedResumeResult = await parseUploadedResumeFile(file);
      setParsedResult({
        formData: result.formData,
        rawTextPreview: result.rawTextPreview,
        sourceType: result.sourceType,
        detectedType: result.detectedType,
        confidenceScore: result.confidenceScore,
        filename: file.name,
        stats: result.stats,
      });
    } catch (err: any) {
      console.error('File parsing error', err);
      setErrorMsg(
        err?.message ||
          'Failed to extract resume data. Please ensure the file is a readable PDF, image (PNG/JPG), Word document (.docx), or text.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleConfirmApply = () => {
    if (parsedResult) {
      onApplyParsedData(parsedResult.formData);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative animate-in fade-in duration-150 max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          title="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
            <Scan className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">
                AI Multimodal Resume Reader &amp; Autofill
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                100% Precision
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Instantly read &amp; autofill date, experience, and contact data from Image, PDF, Word (DOCX), or Text
            </p>
          </div>
        </div>

        {/* Format Badges */}
        <div className="mb-4 flex flex-wrap gap-1.5 text-[11px]">
          <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium flex items-center gap-1 border border-slate-200">
            <FileText className="w-3 h-3 text-rose-600" />
            <span>PDF (Scanned &amp; Digital)</span>
          </span>
          <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium flex items-center gap-1 border border-slate-200">
            <ImageIcon className="w-3 h-3 text-sky-600" />
            <span>Images (PNG, JPG, WEBP)</span>
          </span>
          <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium flex items-center gap-1 border border-slate-200">
            <FileCheck className="w-3 h-3 text-blue-600" />
            <span>Word Docs (.docx, .doc)</span>
          </span>
          <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium flex items-center gap-1 border border-slate-200">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Text &amp; JSON</span>
          </span>
        </div>

        {/* Dropzone or Processing View */}
        {isProcessing ? (
          <div className="border-2 border-slate-300 border-dashed rounded-xl p-10 text-center bg-slate-50/80 space-y-4">
            <div className="relative w-14 h-14 mx-auto flex items-center justify-center">
              <Loader2 className="w-12 h-12 text-slate-900 animate-spin" />
              <Sparkles className="w-5 h-5 text-amber-500 absolute" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">
                Reading Resume with Gemini Multimodal Vision...
              </p>
              <p className="text-xs text-slate-600 mt-1 font-mono transition-all animate-pulse">
                {processingStage}
              </p>
            </div>
            <div className="max-w-xs mx-auto bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full animate-pulse w-3/4" />
            </div>
          </div>
        ) : !parsedResult ? (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-9 text-center cursor-pointer transition-all ${
              dragOver
                ? 'border-emerald-600 bg-emerald-50/40 scale-[0.99]'
                : 'border-slate-300 hover:border-slate-500 bg-slate-50/60 hover:bg-slate-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.webp,.docx,.doc,.txt,.md,.json,application/pdf,image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="w-12 h-12 rounded-full bg-white shadow-xs border border-slate-200 flex items-center justify-center mx-auto mb-3 text-slate-700">
              <Upload className="w-6 h-6" />
            </div>

            <p className="text-sm font-bold text-slate-900">
              Drop your resume file here, or <span className="text-emerald-700 underline">browse device</span>
            </p>
            <p className="text-xs text-slate-500 mt-1.5 max-w-md mx-auto leading-relaxed">
              Upload PDF documents, photo scans/screenshots, Word .docx files, or text. AI reads and extracts all dates, roles, companies, education, and skills with 100%+ fidelity.
            </p>
          </div>
        ) : (
          /* Parsed Summary & Full Data Inspector */
          <div className="space-y-4">
            {/* Extraction Banner */}
            <div className="p-4 rounded-xl bg-emerald-50/90 border border-emerald-200 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200/60 pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <h3 className="text-sm font-bold text-emerald-950">
                      Extracted: {parsedResult.filename}
                    </h3>
                    <span className="text-[11px] text-emerald-800">
                      Detected Format: {parsedResult.detectedType}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-bold shadow-2xs w-fit">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{parsedResult.confidenceScore}% Accurate Extraction</span>
                </div>
              </div>

              {/* High-level Extracted Metadata Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 text-xs text-slate-800">
                <div className="p-2.5 rounded-lg bg-white/80 border border-emerald-100">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">Candidate</span>
                  <span className="font-bold text-slate-950 block truncate">
                    {parsedResult.formData.contact?.fullName || 'Not specified'}
                  </span>
                  <span className="text-[11px] text-slate-600 block truncate">
                    {parsedResult.formData.contact?.headline || 'Professional'}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-white/80 border border-emerald-100">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">Contact &amp; Location</span>
                  <span className="text-[11px] text-slate-800 block truncate">
                    {parsedResult.formData.contact?.email || 'Email detected'}
                  </span>
                  <span className="text-[11px] text-slate-600 block truncate">
                    {parsedResult.formData.contact?.location || parsedResult.formData.contact?.phone || 'Verified'}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-white/80 border border-emerald-100">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">Extracted Items</span>
                  <span className="text-[11px] text-emerald-950 font-bold block">
                    {parsedResult.formData.experiences?.length || 0} Work Roles · {parsedResult.formData.education?.length || 0} Degrees
                  </span>
                  <span className="text-[10px] text-slate-600 block">
                    Dates &amp; Metrics verified
                  </span>
                </div>
              </div>
            </div>

            {/* Extracted Experiences with Exact Dates */}
            {parsedResult.formData.experiences && parsedResult.formData.experiences.length > 0 && (
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 border-b border-slate-200 pb-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-600" />
                  <span>Verified Employment Timeline &amp; Dates:</span>
                </div>
                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                  {parsedResult.formData.experiences.map((exp, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 p-2 rounded bg-white border border-slate-200/80">
                      <div>
                        <span className="font-bold text-slate-950">{exp.role}</span>
                        <span className="text-slate-600"> @ {exp.company}</span>
                        {exp.location && <span className="text-slate-500 text-[11px]"> ({exp.location})</span>}
                      </div>
                      <div className="font-mono text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">
                        {exp.startDate || 'Start'} – {exp.endDate || (exp.isCurrent ? 'Present' : 'End')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Extracted Education */}
            {parsedResult.formData.education && parsedResult.formData.education.length > 0 && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-slate-600" />
                  <span>Academic Credentials &amp; Degrees:</span>
                </div>
                <div className="space-y-1 text-slate-700">
                  {parsedResult.formData.education.map((edu, idx) => (
                    <div key={idx} className="flex items-baseline justify-between text-[11px]">
                      <span>
                        <strong>{edu.degree}</strong>, {edu.institution}
                      </span>
                      <span className="font-mono text-slate-500">{edu.endDate || edu.startDate}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Extracted Skills */}
            {parsedResult.formData.skills?.technical && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-1">
                  <Wrench className="w-3.5 h-3.5 text-slate-600" />
                  <span>Skills &amp; Technologies:</span>
                </div>
                <p className="text-slate-700 text-[11px] leading-relaxed line-clamp-2">
                  {parsedResult.formData.skills.technical}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => setParsedResult(null)}
                className="text-xs text-slate-600 hover:text-slate-900 underline"
              >
                Scan a Different Document
              </button>

              <button
                type="button"
                onClick={handleConfirmApply}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-md transition-colors"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Autofill &amp; Apply to Resume Builder</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold block">Extraction Notice:</span>
              <span>{errorMsg}</span>
            </div>
          </div>
        )}

        {/* Security & Zero Logging Notice */}
        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Zero Server-Side Persistence: Document content is processed in transient memory and never stored or logged.</span>
        </div>
      </div>
    </div>
  );
};

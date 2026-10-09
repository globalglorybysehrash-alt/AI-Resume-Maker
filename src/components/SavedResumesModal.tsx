import React, { useState, useMemo } from 'react';
import { StoredResumeRecord } from '../lib/firebase';
import {
  X,
  FileText,
  Trash2,
  Calendar,
  Clock,
  Sparkles,
  Cloud,
  Check,
  AlertCircle,
  Tag,
  GitBranch,
  Layers,
  Edit2,
  Plus,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import { ResumeFormData, GenerationResult } from '../types/resume';

interface SavedResumesModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumes: StoredResumeRecord[];
  onLoadResume: (record: StoredResumeRecord) => void;
  onDeleteResume: (id: string) => Promise<void>;
  onSaveCurrentResume: (
    title: string,
    versionLabel?: string,
    existingId?: string,
    baseId?: string
  ) => Promise<void>;
  onUpdateVersionLabel?: (id: string, newLabel: string) => Promise<void>;
  currentTitle: string;
  hasCurrentData: boolean;
}

const COMMON_VERSION_LABELS = ['Draft 1', 'Draft 2', 'Final', 'Job A', 'Job B', 'Tailored Tech'];

export const SavedResumesModal: React.FC<SavedResumesModalProps> = ({
  isOpen,
  onClose,
  resumes,
  onLoadResume,
  onDeleteResume,
  onSaveCurrentResume,
  onUpdateVersionLabel,
  currentTitle,
  hasCurrentData,
}) => {
  const [saveTitle, setSaveTitle] = useState(currentTitle || 'My Professional Resume');
  const [versionLabel, setVersionLabel] = useState('Draft 1');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Active filter by version label
  const [activeFilterLabel, setActiveFilterLabel] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // In-line editing of version label
  const [editingResumeId, setEditingResumeId] = useState<string | null>(null);
  const [editingLabelValue, setEditingLabelValue] = useState<string>('');

  // Loaded record feedback
  const [loadedId, setLoadedId] = useState<string | null>(null);

  // Derive all unique version labels present in user's saved resumes
  const existingLabels = useMemo(() => {
    const labels = new Set<string>();
    resumes.forEach((r) => {
      if (r.versionLabel) labels.add(r.versionLabel);
    });
    return Array.from(labels);
  }, [resumes]);

  // Group resumes by baseId or normalized title to display version lineage
  const groupedResumes = useMemo(() => {
    const groups: Record<string, StoredResumeRecord[]> = {};

    resumes.forEach((rec) => {
      const key = rec.baseId || rec.title.toLowerCase().trim();
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(rec);
    });

    // Sort versions within each group descending by versionNumber or updatedAt
    Object.values(groups).forEach((list) => {
      list.sort((a, b) => {
        const vA = a.versionNumber || 1;
        const vB = b.versionNumber || 1;
        if (vB !== vA) return vB - vA;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
    });

    return groups;
  }, [resumes]);

  // Filtered list
  const filteredResumes = useMemo(() => {
    return resumes.filter((r) => {
      const matchesFilter =
        activeFilterLabel === 'All' || r.versionLabel === activeFilterLabel;
      const matchesSearch =
        !searchQuery ||
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.versionLabel && r.versionLabel.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (r.formData?.contact?.fullName &&
          r.formData.contact.fullName.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesFilter && matchesSearch;
    });
  }, [resumes, activeFilterLabel, searchQuery]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!saveTitle.trim()) return;

    setIsSaving(true);
    setErrorMsg(null);
    try {
      await onSaveCurrentResume(saveTitle.trim(), versionLabel.trim() || 'Draft 1');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to save resume version to cloud.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartEditLabel = (rec: StoredResumeRecord) => {
    setEditingResumeId(rec.id);
    setEditingLabelValue(rec.versionLabel || 'Draft 1');
  };

  const handleSaveEditedLabel = async (id: string) => {
    if (!onUpdateVersionLabel || !editingLabelValue.trim()) {
      setEditingResumeId(null);
      return;
    }

    try {
      await onUpdateVersionLabel(id, editingLabelValue.trim());
      setEditingResumeId(null);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to update version label');
    }
  };

  const handleSelectRecord = (rec: StoredResumeRecord) => {
    onLoadResume(rec);
    setLoadedId(rec.id);
    setTimeout(() => {
      onClose();
    }, 450);
  };

  // Helper for badge colors based on label text
  const getBadgeStyle = (label?: string) => {
    if (!label) return 'bg-slate-100 text-slate-700 border-slate-200';
    const l = label.toLowerCase();
    if (l.includes('final')) return 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold';
    if (l.includes('draft')) return 'bg-amber-100 text-amber-800 border-amber-300';
    if (l.includes('job a')) return 'bg-indigo-100 text-indigo-800 border-indigo-300 font-semibold';
    if (l.includes('job b')) return 'bg-purple-100 text-purple-800 border-purple-300 font-semibold';
    return 'bg-blue-100 text-blue-800 border-blue-300';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 relative max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <GitBranch className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Cloud Resume Versions &amp; Drafts
              </h2>
              <p className="text-xs text-slate-500">
                Save, label, and seamlessly toggle between multiple versions (e.g. Draft 1, Final, Job A)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg focus:outline-none"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Save Current Resume with Version Label Section */}
        {hasCurrentData && (
          <form onSubmit={handleSave} className="my-4 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Cloud className="w-3.5 h-3.5 text-emerald-600" />
                <span>Save Current Resume as a Version</span>
              </label>
              <span className="text-[11px] text-slate-500">
                Saves to personal Firebase Cloud
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
              <div className="sm:col-span-6">
                <input
                  type="text"
                  value={saveTitle}
                  onChange={(e) => setSaveTitle(e.target.value)}
                  placeholder="Document Title (e.g. Lead Engineer Resume)"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                  required
                />
              </div>

              <div className="sm:col-span-4">
                <input
                  type="text"
                  value={versionLabel}
                  onChange={(e) => setVersionLabel(e.target.value)}
                  placeholder="Version Tag (e.g. Draft 1, Final, Job A)"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={isSaving || !saveTitle.trim()}
                  className="w-full h-full min-h-[34px] px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  {saveSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Saved!</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>{isSaving ? 'Saving...' : 'Save Version'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Version Label Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              <span className="text-[11px] text-slate-500 font-medium">Quick Labels:</span>
              {COMMON_VERSION_LABELS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setVersionLabel(preset)}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-medium border transition-colors ${
                    versionLabel === preset
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>

            {errorMsg && (
              <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errorMsg}
              </p>
            )}
          </form>
        )}

        {/* Filters and Search Bar */}
        <div className="pb-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          {/* Label Filter Chips */}
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto py-1">
            <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
              <Filter className="w-3 h-3" />
              <span>Filter:</span>
            </span>
            <button
              type="button"
              onClick={() => setActiveFilterLabel('All')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                activeFilterLabel === 'All'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All Versions ({resumes.length})
            </button>

            {['Final', 'Draft 1', 'Job A', 'Job B'].map((tag) => {
              const count = resumes.filter((r) => r.versionLabel === tag).length;
              if (count === 0 && !existingLabels.includes(tag)) return null;

              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setActiveFilterLabel(tag)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors border ${
                    activeFilterLabel === tag
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {tag} {count > 0 && <span className="opacity-75">({count})</span>}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-48">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search versions..."
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
        </div>

        {/* Resumes and Versions List */}
        <div className="flex-1 overflow-y-auto space-y-3 py-1 pr-1">
          {filteredResumes.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No matching resume versions found</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {resumes.length === 0
                  ? 'Fill in your details and save your first version with a label like "Draft 1" or "Final".'
                  : 'Try clearing your filter or search query.'}
              </p>
            </div>
          ) : (
            filteredResumes.map((rec) => {
              const groupKey = rec.baseId || rec.title.toLowerCase().trim();
              const siblingVersions = groupedResumes[groupKey] || [];
              const isLoaded = loadedId === rec.id;

              return (
                <div
                  key={rec.id}
                  className={`p-4 rounded-xl border transition-all shadow-xs ${
                    isLoaded
                      ? 'border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-400'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900">{rec.title}</h3>

                        {/* Version Label Badge with In-line Edit */}
                        {editingResumeId === rec.id ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              value={editingLabelValue}
                              onChange={(e) => setEditingLabelValue(e.target.value)}
                              className="px-2 py-0.5 text-xs rounded border border-indigo-400 focus:outline-none w-28 bg-white"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveEditedLabel(rec.id)}
                              className="px-1.5 py-0.5 bg-slate-900 text-white rounded text-[10px] font-semibold"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingResumeId(null)}
                              className="px-1 py-0.5 text-slate-500 text-[10px]"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[11px] border flex items-center gap-1 ${getBadgeStyle(
                                rec.versionLabel
                              )}`}
                            >
                              <Tag className="w-2.5 h-2.5 opacity-70" />
                              <span>{rec.versionLabel || 'Draft 1'}</span>
                              {rec.versionNumber && rec.versionNumber > 1 && (
                                <span className="opacity-70 text-[10px] font-mono">
                                  (v{rec.versionNumber})
                                </span>
                              )}
                            </span>

                            {onUpdateVersionLabel && (
                              <button
                                type="button"
                                onClick={() => handleStartEditLabel(rec)}
                                className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
                                title="Edit version label"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          Updated: {new Date(rec.updatedAt).toLocaleDateString()}
                        </span>
                        {rec.formData?.contact?.fullName && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>Candidate: {rec.formData.contact.fullName}</span>
                          </>
                        )}
                        {rec.generatedResult && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-emerald-700 font-medium">Includes AI Documents</span>
                          </>
                        )}
                      </div>

                      {/* Sibling Versions Quick-Toggle Pills */}
                      {siblingVersions.length > 1 && (
                        <div className="pt-2 flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                            <Layers className="w-2.5 h-2.5" />
                            <span>Switch Version:</span>
                          </span>
                          {siblingVersions.map((sib) => {
                            const isCurrent = sib.id === rec.id;
                            return (
                              <button
                                key={sib.id}
                                type="button"
                                onClick={() => handleSelectRecord(sib)}
                                className={`px-2 py-0.5 rounded text-[11px] font-medium border transition-colors flex items-center gap-1 ${
                                  isCurrent
                                    ? 'bg-slate-900 text-white border-slate-900 font-bold'
                                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                                }`}
                                title={`Toggle to version: ${sib.versionLabel || 'Draft'}`}
                              >
                                <span>{sib.versionLabel || `v${sib.versionNumber || 1}`}</span>
                                {isCurrent && <Check className="w-2.5 h-2.5 text-emerald-400" />}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
                      <button
                        type="button"
                        onClick={() => handleSelectRecord(rec)}
                        className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs ${
                          isLoaded
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-900 hover:bg-slate-800 text-white'
                        }`}
                      >
                        {isLoaded ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Loaded!</span>
                          </>
                        ) : (
                          <>
                            <span>Load Version</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteResume(rec.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Delete this version"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>Protected by Firebase Firestore Security Rules</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { GeneratedResumeData, ResumeTemplateMeta } from '../../types/resume';

export type AccentColor = 'slate' | 'navy' | 'emerald' | 'indigo' | 'burgundy' | 'gold';
export type SpacingDensity = 'comfortable' | 'standard' | 'compact';
export type FontMode = 'sans' | 'serif' | 'mono';

export interface TemplateRenderProps {
  resumeData: GeneratedResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<GeneratedResumeData | null>>;
  isEditing: boolean;
  renderTextWithPlaceholderHighlight: (text: string) => React.ReactNode;
  templateMeta: ResumeTemplateMeta;
  accentColor: AccentColor;
  density: SpacingDensity;
  fontMode: FontMode;
  showPhoto: boolean;
  onUploadPhotoClick?: () => void;
}

export const ACCENT_COLOR_MAP: Record<AccentColor, {
  primary: string;
  secondary: string;
  badge: string;
  border: string;
  text: string;
  gradient: string;
}> = {
  slate: {
    primary: '#0f172a',
    secondary: '#334155',
    badge: 'bg-slate-100 text-slate-800 border-slate-300',
    border: 'border-slate-900',
    text: 'text-slate-900',
    gradient: 'from-slate-900 to-slate-800',
  },
  navy: {
    primary: '#0f2744',
    secondary: '#1e3a5f',
    badge: 'bg-sky-50 text-[#0f2744] border-sky-200',
    border: 'border-[#0f2744]',
    text: 'text-[#0f2744]',
    gradient: 'from-[#0f2744] to-[#1e3a5f]',
  },
  emerald: {
    primary: '#064e3b',
    secondary: '#047857',
    badge: 'bg-emerald-50 text-emerald-900 border-emerald-200',
    border: 'border-emerald-800',
    text: 'text-emerald-900',
    gradient: 'from-emerald-900 to-teal-800',
  },
  indigo: {
    primary: '#312e81',
    secondary: '#4338ca',
    badge: 'bg-indigo-50 text-indigo-900 border-indigo-200',
    border: 'border-indigo-900',
    text: 'text-indigo-900',
    gradient: 'from-indigo-950 to-indigo-800',
  },
  burgundy: {
    primary: '#4c0519',
    secondary: '#881337',
    badge: 'bg-rose-50 text-rose-950 border-rose-200',
    border: 'border-rose-900',
    text: 'text-rose-950',
    gradient: 'from-rose-950 to-rose-900',
  },
  gold: {
    primary: '#78350f',
    secondary: '#b45309',
    badge: 'bg-amber-50 text-amber-950 border-amber-300',
    border: 'border-amber-700',
    text: 'text-amber-950',
    gradient: 'from-amber-950 to-amber-800',
  },
};

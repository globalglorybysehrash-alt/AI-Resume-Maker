import React, { useState } from 'react';
import { TOP_50_GLOBAL_TEMPLATES } from '../data/templates50Data';
import { ResumeTemplateMeta, TemplateLayoutStyle } from '../types/resume';
import {
  Search,
  CheckCircle,
  ExternalLink,
  Tag,
  Layers,
  ShieldCheck,
  Eye,
  X,
  Sparkles,
  Globe2,
  FileCheck2,
  Filter,
  ArrowRight,
  Flame,
  LayoutGrid,
  Columns,
  BookOpen,
  Camera,
  Briefcase,
  Check,
} from 'lucide-react';

interface GlobalTemplatesHubProps {
  onSelectTemplate: (template: ResumeTemplateMeta) => void;
  activeTemplateId: string;
}

export const GlobalTemplatesHub: React.FC<GlobalTemplatesHubProps> = ({
  onSelectTemplate,
  activeTemplateId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedLayout, setSelectedLayout] = useState<string>('All');
  const [photoFilter, setPhotoFilter] = useState<string>('All');
  const [activeModalTemplate, setActiveModalTemplate] = useState<ResumeTemplateMeta | null>(null);

  const categories = [
    'All',
    'North America',
    'Europe',
    'Asia Pacific',
    'Middle East',
    'Global & Remote',
    'Executive & Specialty',
  ];

  const layoutFilters: { id: string; label: string }[] = [
    { id: 'All', label: 'All Architectures' },
    { id: 'silicon-valley', label: 'Silicon Valley ATS' },
    { id: 'modern-split', label: 'Two-Column Split' },
    { id: 'executive-serif', label: 'Executive Serif' },
    { id: 'dach-lebenslauf', label: 'DACH DIN 5008' },
    { id: 'dubai-executive', label: 'Dubai Executive Gold' },
    { id: 'nordic-minimalist', label: 'Nordic Minimalist' },
    { id: 'tokyo-structured', label: 'Tokyo Structured' },
    { id: 'creative-accent', label: 'Creative Accent' },
  ];

  const filteredTemplates = TOP_50_GLOBAL_TEMPLATES.filter((tpl) => {
    const matchesCategory =
      selectedCategory === 'All' || tpl.category === selectedCategory;

    const matchesLayout =
      selectedLayout === 'All' || tpl.layoutStyle === selectedLayout;

    const matchesPhoto =
      photoFilter === 'All' ||
      (photoFilter === 'Forbidden' && tpl.photoRule === 'Forbidden') ||
      (photoFilter === 'Customary' && (tpl.photoRule === 'Customary' || tpl.photoRule === 'Mandatory')) ||
      (photoFilter === 'Optional' && tpl.photoRule === 'Optional');

    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      tpl.name.toLowerCase().includes(searchLower) ||
      tpl.country.toLowerCase().includes(searchLower) ||
      tpl.description.toLowerCase().includes(searchLower) ||
      tpl.layoutStyle.toLowerCase().includes(searchLower) ||
      tpl.features.some((f) => f.toLowerCase().includes(searchLower));

    return matchesCategory && matchesLayout && matchesPhoto && matchesSearch;
  });

  const getLayoutBadge = (style: TemplateLayoutStyle) => {
    switch (style) {
      case 'silicon-valley':
        return { label: 'Silicon Valley ATS', color: 'bg-slate-900 text-white border-slate-900' };
      case 'modern-split':
        return { label: '2-Column Split', color: 'bg-sky-100 text-sky-900 border-sky-300' };
      case 'executive-serif':
        return { label: 'Executive Serif', color: 'bg-amber-100 text-amber-950 border-amber-300' };
      case 'dach-lebenslauf':
        return { label: 'DIN 5008 Tabular', color: 'bg-emerald-100 text-emerald-950 border-emerald-300' };
      case 'dubai-executive':
        return { label: 'Dubai Executive Gold', color: 'bg-[#0f2744] text-amber-300 border-[#0f2744]' };
      case 'nordic-minimalist':
        return { label: 'Nordic Minimal', color: 'bg-slate-100 text-slate-800 border-slate-300' };
      case 'tokyo-structured':
        return { label: 'Tokyo Grid Bilingual', color: 'bg-indigo-100 text-indigo-950 border-indigo-300' };
      case 'creative-accent':
        return { label: 'Creative Accent Spine', color: 'bg-rose-100 text-rose-950 border-rose-300' };
      default:
        return { label: 'Universal ATS', color: 'bg-slate-100 text-slate-800 border-slate-300' };
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      {/* Hero Header */}
      <div className="text-center max-w-4xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-semibold mb-3">
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          <span>Top 50 Most Viral &amp; Demanded Templates in the World</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950">
          State-of-the-Art Global Career Templates
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
          Every major country resume &amp; cover letter standard with exact legal compliance, photo rules,
          page lengths, and distinctive visual architectures to win jobs globally.
        </p>

        {/* Search Bar */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-2xl mx-auto">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by country, architecture, or title (e.g. Two-Column, Germany, Silicon Valley, Dubai)..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5 p-1 bg-slate-100 rounded-xl max-w-3xl mx-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Visual Layout Architecture Filter Pills */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 max-w-4xl mx-auto">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
            <Columns className="w-3 h-3 text-slate-500" />
            <span>Architecture:</span>
          </span>
          {layoutFilters.map((lf) => (
            <button
              key={lf.id}
              onClick={() => setSelectedLayout(lf.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                selectedLayout === lf.id
                  ? 'bg-slate-900 text-white border-slate-900 font-bold shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {lf.label}
            </button>
          ))}
        </div>

        {/* Quick Photo Filter Toggle */}
        <div className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-500">
          <span className="font-semibold">Photo Rule:</span>
          {['All', 'Forbidden', 'Customary', 'Optional'].map((rule) => (
            <button
              key={rule}
              onClick={() => setPhotoFilter(rule)}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                photoFilter === rule
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-200/80 text-slate-700 hover:bg-slate-300'
              }`}
            >
              {rule}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between mb-6 border-b border-slate-200 pb-3 text-xs text-slate-500">
        <div>
          Showing <span className="font-bold text-slate-900">{filteredTemplates.length}</span> of 50 global templates
        </div>
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Compliant with local labor laws</span>
        </div>
      </div>

      {/* Grid of 50 Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => {
          const isActive = activeTemplateId === template.id;
          const badge = getLayoutBadge(template.layoutStyle);

          return (
            <div
              key={template.id}
              className={`bg-white border rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${
                isActive ? 'border-slate-900 ring-2 ring-slate-900' : 'border-slate-200'
              }`}
            >
              <div className="p-6">
                {/* Header: Flag, Country, Score, Layout Badge */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl" role="img" aria-label={template.country}>
                      {template.flag}
                    </span>
                    <div>
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                        {template.country}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 leading-snug">
                        {template.name}
                      </h3>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold shrink-0">
                    <Flame className="w-3 h-3 text-amber-600" />
                    {template.viralScore}%
                  </span>
                </div>

                {/* Visual Architecture Pill */}
                <div className="mt-1 mb-2">
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${badge.color}`}>
                    {badge.label}
                  </span>
                </div>

                <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                  {template.description}
                </p>

                {/* Country Specs Badges */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-1.5 text-[11px]">
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-medium">
                    {template.recommendedPages}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded font-medium ${
                      template.photoRule === 'Forbidden'
                        ? 'bg-rose-50 text-rose-800 border border-rose-200'
                        : template.photoRule === 'Customary'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-slate-100 text-slate-800'
                    }`}
                  >
                    Photo: {template.photoRule}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {template.category}
                  </span>
                </div>

                {/* Key Features List */}
                <div className="mt-3 space-y-1">
                  {template.features.slice(0, 2).map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-600">
                      <CheckCircle className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModalTemplate(template)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-200/70 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Specs &amp; Layout</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectTemplate(template)}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors shadow-xs flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-emerald-700 text-white'
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  {isActive ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Active Style</span>
                    </>
                  ) : (
                    <>
                      <span>Apply Template</span>
                      <ArrowRight className="w-3 h-3" />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Detail for Country Specifications & Visual Layout Mockup */}
      {activeModalTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto animate-in fade-in duration-150">
            <button
              onClick={() => setActiveModalTemplate(null)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="text-3xl" role="img" aria-label={activeModalTemplate.country}>
                {activeModalTemplate.flag}
              </span>
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {activeModalTemplate.country} · {activeModalTemplate.countrySpecs.formatName}
                </span>
                <h3 className="text-lg font-bold text-slate-900">{activeModalTemplate.name}</h3>
              </div>
            </div>

            <div className="my-2">
              <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider border ${getLayoutBadge(activeModalTemplate.layoutStyle).color}`}>
                Layout Architecture: {getLayoutBadge(activeModalTemplate.layoutStyle).label}
              </span>
            </div>

            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              {activeModalTemplate.description}
            </p>

            {/* Country Legal & Recruiter Guidelines */}
            <div className="mt-5 space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                <span className="font-bold text-slate-900 block">Photo &amp; Image Guideline:</span>
                <p className="text-slate-700 leading-relaxed">
                  {activeModalTemplate.countrySpecs.photoGuideline}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                <span className="font-bold text-slate-900 block">Customary Length &amp; Density:</span>
                <p className="text-slate-700 leading-relaxed">
                  {activeModalTemplate.countrySpecs.lengthGuideline}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 space-y-1.5 text-xs text-rose-900">
                <span className="font-bold block">Strictly Prohibited / Avoided Details:</span>
                <ul className="list-disc pl-4 space-y-0.5">
                  {activeModalTemplate.countrySpecs.prohibitedInfo.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1.5 text-xs text-emerald-950">
                <span className="font-bold block">Mandatory / Customary Elements:</span>
                <ul className="list-disc pl-4 space-y-0.5">
                  {activeModalTemplate.countrySpecs.mandatoryCustomaryInfo.map((m, i) => (
                    <li key={i}>{m}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950">
                <span className="font-bold block mb-1">Local Recruiter Pro-Tip:</span>
                <p className="leading-relaxed">{activeModalTemplate.countrySpecs.localTips}</p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveModalTemplate(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => {
                  onSelectTemplate(activeModalTemplate);
                  setActiveModalTemplate(null);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs"
              >
                <span>Use This Template Style</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

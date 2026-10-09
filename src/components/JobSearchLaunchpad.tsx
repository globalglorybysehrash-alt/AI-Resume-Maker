import React, { useState } from 'react';
import { GLOBAL_JOB_PORTALS } from '../data/jobSitesData';
import { WINNING_JOB_SEEKER_GUIDELINES, GLOBAL_COUNTRY_GUIDELINES } from '../data/countryGuidelinesData';
import { ResumeFormData } from '../types/resume';
import { MarketSalaryExplorer } from './MarketSalaryExplorer';
import {
  Briefcase,
  Search,
  ExternalLink,
  Upload,
  Download,
  Copy,
  Check,
  Globe2,
  Sparkles,
  Award,
  BookOpen,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ShieldCheck,
  FileDown,
} from 'lucide-react';

interface JobSearchLaunchpadProps {
  formData: ResumeFormData;
  onOpenUploadModal: () => void;
  onDownloadPdf: () => void;
  hasGeneratedData: boolean;
  onGoToResume: () => void;
}

export const JobSearchLaunchpad: React.FC<JobSearchLaunchpadProps> = ({
  formData,
  onOpenUploadModal,
  onDownloadPdf,
  hasGeneratedData,
  onGoToResume,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [customRole, setCustomRole] = useState(
    formData.targetJob.title || formData.contact.headline || 'Software Engineer'
  );
  const [customLocation, setCustomLocation] = useState(
    formData.targetJob.targetCountry || formData.contact.location || 'United States'
  );
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [expandedCountry, setExpandedCountry] = useState<string | null>('United States');

  const categories = [
    'All',
    'Global',
    'Remote / Tech',
    'USA / Canada',
    'UK & Ireland',
    'Europe & DACH',
    'Asia Pacific',
    'Middle East & Gulf',
  ];

  const filteredPortals = GLOBAL_JOB_PORTALS.filter((portal) => {
    const matchesCategory =
      selectedCategory === 'All' || portal.category === selectedCategory;

    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      portal.name.toLowerCase().includes(searchLower) ||
      portal.description.toLowerCase().includes(searchLower) ||
      portal.featuredCountries.some((c) => c.toLowerCase().includes(searchLower)) ||
      portal.tags.some((t) => t.toLowerCase().includes(searchLower));

    return matchesCategory && matchesSearch;
  });

  const generateLaunchUrl = (template: string) => {
    const roleEnc = encodeURIComponent(customRole.trim() || 'Software Engineer');
    const locEnc = encodeURIComponent(customLocation.trim() || 'United States');
    return template.replace('{role}', roleEnc).replace('{country}', locEnc);
  };

  const handleCopySearchUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(url);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-semibold mb-3">
          <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
          <span>Global Job Search Directory &amp; Application Launchpad</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950">
          Where to Find &amp; Win Jobs in Every Part of the World
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
          Access the top worldwide job portals, launch customized 1-click searches for your role,
          upload your resume directly, and master country-by-country hiring etiquette.
        </p>

        {/* Quick Action Ribbon */}
        <div className="mt-6 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={onOpenUploadModal}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Direct Upload &amp; Parse Resume</span>
          </button>

          {hasGeneratedData ? (
            <button
              type="button"
              onClick={onDownloadPdf}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
            >
              <FileDown className="w-3.5 h-3.5 text-emerald-600" />
              <span>Download Tailored PDF for Portals</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onGoToResume}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <span>Build Tailored Resume First</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 1-Click Automated Search Query Generator */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center">
              <Search className="w-4 h-4 text-slate-700" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">1-Click Job Search Query Generator</h2>
              <p className="text-xs text-slate-500">
                Pre-fills your exact target role and country across all major hiring portals
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div>
              <input
                type="text"
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                placeholder="Target Role (e.g. Lead Engineer)"
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 w-44 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div>
              <input
                type="text"
                value={customLocation}
                onChange={(e) => setCustomLocation(e.target.value)}
                placeholder="Country / City (e.g. United States)"
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 w-40 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Quick Launch Shortcuts */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 mr-1">Quick Launch:</span>
          {GLOBAL_JOB_PORTALS.slice(0, 7).map((portal) => {
            const launchUrl = generateLaunchUrl(portal.searchQueryTemplate);

            return (
              <a
                key={portal.id}
                href={launchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors group"
              >
                <span>{portal.name}</span>
                <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-slate-700" />
              </a>
            );
          })}
        </div>
      </div>

      {/* Google Search Grounded Market Salary Intelligence */}
      <MarketSalaryExplorer
        initialRole={customRole || formData.targetJob.title || formData.contact.headline}
        initialCountry={customLocation || formData.targetJob.targetCountry || formData.contact.location}
      />

      {/* Portal Directory with Filters */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Curated Global &amp; Regional Job Boards</h2>
            <p className="text-xs text-slate-500">
              Direct application gateways, salary benchmarking engines, and local hiring heavyweights
            </p>
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search portal or region..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
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

        {/* Portal Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPortals.map((portal) => {
            const searchUrl = generateLaunchUrl(portal.searchQueryTemplate);

            return (
              <div
                key={portal.id}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                        {portal.category}
                      </span>
                      <h3 className="text-base font-bold text-slate-900">{portal.name}</h3>
                    </div>

                    <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                      {portal.logoText}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mt-1">
                    {portal.description}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-1 text-[11px]">
                    {portal.tags.map((tag, tIdx) => (
                      <span key={tIdx} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="mt-3 text-[11px] text-slate-400">
                    Primary: {portal.featuredCountries.slice(0, 3).join(', ')}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopySearchUrl(searchUrl)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                    title="Copy search URL"
                  >
                    {copiedLink === searchUrl ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>

                  <div className="flex items-center gap-2">
                    <a
                      href={portal.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900"
                    >
                      Visit Home
                    </a>

                    <a
                      href={searchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs"
                    >
                      <span>Search Jobs</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Global Best Practices Masterclass to Win Jobs */}
      <section className="bg-slate-900 text-white rounded-2xl p-6 sm:p-10 shadow-lg">
        <div className="max-w-3xl mb-8">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
            <Award className="w-4 h-4" />
            <span>Global Career Playbook</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            6 Proven Rules to Win Jobs in Any Country
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
            Synthesized from senior hiring managers, executive headhunters, and technical recruiters across
            Silicon Valley, London, Frankfurt, Dubai, Singapore, and Sydney.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {WINNING_JOB_SEEKER_GUIDELINES.map((rule) => (
            <div
              key={rule.step}
              className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-5 space-y-2"
            >
              <div className="text-xs font-mono font-bold text-emerald-400">RULE {rule.step}</div>
              <h3 className="text-sm font-bold text-white leading-snug">{rule.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{rule.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Country-by-Country Hiring Etiquette & Salary Negotiations */}
      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Country-by-Country Hiring Etiquette &amp; Negotiation Guide
          </h2>
          <p className="text-xs text-slate-500">
            Key legal requirements, photo policies, interview demeanor, and salary package nuances by territory
          </p>
        </div>

        <div className="space-y-3">
          {GLOBAL_COUNTRY_GUIDELINES.map((guide) => {
            const isExpanded = expandedCountry === guide.country;

            return (
              <div
                key={guide.code}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs"
              >
                <button
                  type="button"
                  onClick={() => setExpandedCountry(isExpanded ? null : guide.country)}
                  className="w-full text-left p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors focus:outline-none"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl" role="img">
                      {guide.flag}
                    </span>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900">
                        {guide.country} · {guide.documentTitle}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span>Length: {guide.customaryLength}</span>
                        <span aria-hidden="true">·</span>
                        <span
                          className={`font-semibold ${
                            guide.photoRule.includes('Forbidden')
                              ? 'text-rose-600'
                              : guide.photoRule === 'Customary'
                              ? 'text-amber-700'
                              : 'text-slate-600'
                          }`}
                        >
                          Photo: {guide.photoRule}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-slate-400">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="p-5 pt-0 border-t border-slate-100 space-y-4 text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                        <span className="font-bold text-slate-900 block">Interview Demeanor:</span>
                        <p className="text-slate-700 leading-relaxed">{guide.interviewEtiquette}</p>
                      </div>

                      <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 space-y-1 text-emerald-950">
                        <span className="font-bold block">Salary &amp; Compensation Strategy:</span>
                        <p className="leading-relaxed">{guide.salaryNegotiationTip}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="font-bold text-slate-800 block mb-1">Standard / Permitted Fields:</span>
                        <div className="flex flex-wrap gap-1">
                          {guide.personalDetailsAllowed.map((item, i) => (
                            <span key={i} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px]">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="font-bold text-rose-800 block mb-1">Strictly Disallowed / Red Flag Fields:</span>
                        <div className="flex flex-wrap gap-1">
                          {guide.personalDetailsDisallowed.map((item, i) => (
                            <span key={i} className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-100 text-[11px]">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50 text-slate-600 text-[11px] leading-relaxed">
                      <span className="font-bold text-slate-800">ATS Formatting Rule: </span>
                      {guide.keyAtsTips}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

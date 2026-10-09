import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Search,
  ExternalLink,
  Sparkles,
  DollarSign,
  MapPin,
  Award,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Lightbulb,
  Globe,
  Coins,
} from 'lucide-react';
import { SalaryDataResult, SalarySearchResponse } from '../data/salaryBenchmarksData';

interface MarketSalaryExplorerProps {
  initialRole?: string;
  initialCountry?: string;
}

export const MarketSalaryExplorer: React.FC<MarketSalaryExplorerProps> = ({
  initialRole = 'Senior Full-Stack Engineer',
  initialCountry = 'United States',
}) => {
  const [role, setRole] = useState(initialRole || 'Software Engineer');
  const [country, setCountry] = useState(initialCountry || 'United States');
  const [level, setLevel] = useState('Senior (6-9 yrs)');

  const [isLoading, setIsLoading] = useState(false);
  const [salaryResult, setSalaryResult] = useState<SalarySearchResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync when initial props change
  useEffect(() => {
    if (initialRole && initialRole !== role) {
      setRole(initialRole);
    }
    if (initialCountry && initialCountry !== country) {
      setCountry(initialCountry);
    }
  }, [initialRole, initialCountry]);

  // Execute live search
  const fetchSalaryData = async (
    targetRole = role,
    targetCountry = country,
    targetLevel = level
  ) => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/salary-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobTitle: targetRole,
          targetCountry: targetCountry,
          experienceLevel: targetLevel,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to retrieve salary insights from market index.');
      }

      const data: SalarySearchResponse = await response.json();
      setSalaryResult(data);
    } catch (err: any) {
      console.error('Salary search error:', err);
      setErrorMsg(err?.message || 'Unable to fetch real-time salary data.');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load on first render
  useEffect(() => {
    fetchSalaryData(role, country, level);
  }, []);

  const handleQuickPreset = (presetRole: string, presetCountry: string, presetLevel: string) => {
    setRole(presetRole);
    setCountry(presetCountry);
    setLevel(presetLevel);
    fetchSalaryData(presetRole, presetCountry, presetLevel);
  };

  const data = salaryResult?.salaryData;

  // Calculate percentage for visual gauge
  const minVal = data ? data.minSalary : 100000;
  const maxVal = data ? data.maxSalary : 200000;
  const medVal = data ? data.medianSalary : 150000;
  const rangeSpan = Math.max(1, maxVal - minVal);
  const medianPercentage = Math.min(90, Math.max(10, Math.round(((medVal - minVal) / rangeSpan) * 100)));

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Google Search Grounded Real-Time Market Intelligence</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Real-Time Salary &amp; Compensation Benchmark
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Live compensation ranges, percentile brackets, bonuses, and regional negotiation insights grounded with real-time Google Search data.
          </p>
        </div>

        {salaryResult?.groundedWithGoogleSearch && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-semibold shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Live Google Search Grounded</span>
          </div>
        )}
      </div>

      {/* Search Filter Controls */}
      <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/50">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchSalaryData(role, country, level);
          }}
          className="grid grid-cols-1 sm:grid-cols-12 gap-3"
        >
          <div className="sm:col-span-4">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Job Title / Professional Role
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Senior Full-Stack Engineer"
              className="w-full px-3.5 py-2 text-xs font-medium rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
              required
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Target Country / Metro
            </label>
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="e.g. United States or Germany"
              className="w-full px-3.5 py-2 text-xs font-medium rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
              required
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Experience Level
            </label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full px-3.5 py-2 text-xs font-medium rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="Entry-Level (0-2 yrs)">Entry-Level (0–2 yrs)</option>
              <option value="Mid-Level (3-5 yrs)">Mid-Level (3–5 yrs)</option>
              <option value="Senior (6-9 yrs)">Senior (6–9 yrs)</option>
              <option value="Staff / Principal / Lead (10+ yrs)">Lead / Principal (10+ yrs)</option>
            </select>
          </div>

          <div className="sm:col-span-2 flex items-end">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Search className="w-3.5 h-3.5" />
                  <span>Search</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Quick Benchmark Presets */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Quick Benchmarks:</span>
          <button
            type="button"
            onClick={() => handleQuickPreset('Software Engineer', 'United States', 'Senior (6-9 yrs)')}
            className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
          >
            🇺🇸 Software Eng (US)
          </button>
          <button
            type="button"
            onClick={() => handleQuickPreset('Full Stack Developer', 'Germany', 'Senior (6-9 yrs)')}
            className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
          >
            🇩🇪 Full Stack (Germany)
          </button>
          <button
            type="button"
            onClick={() => handleQuickPreset('Cloud Architect', 'United Arab Emirates', 'Senior (6-9 yrs)')}
            className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
          >
            🇦🇪 Cloud Architect (UAE)
          </button>
          <button
            type="button"
            onClick={() => handleQuickPreset('Product Manager', 'United Kingdom', 'Mid-Level (3-5 yrs)')}
            className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
          >
            🇬🇧 Product Mgr (UK)
          </button>
          <button
            type="button"
            onClick={() => handleQuickPreset('Frontend Engineer', 'Singapore', 'Senior (6-9 yrs)')}
            className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
          >
            🇸🇬 Frontend (Singapore)
          </button>
          <button
            type="button"
            onClick={() => handleQuickPreset('Lead Engineer', 'India', 'Staff / Principal / Lead (10+ yrs)')}
            className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
          >
            🇮🇳 Lead Eng (India)
          </button>
        </div>
      </div>

      {/* Main Insights Body */}
      <div className="p-5 sm:p-6 space-y-6">
        {errorMsg && (
          <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50 text-xs text-rose-800">
            {errorMsg}
          </div>
        )}

        {data && (
          <div className="space-y-6">
            {/* Visual Percentile Range Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 25th Percentile */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-center">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  25th Percentile (Entry Band)
                </span>
                <span className="text-xl sm:text-2xl font-extrabold text-slate-800">
                  {data.minFormatted}
                </span>
                <span className="text-[11px] text-slate-500 block mt-1">
                  Base compensation floor
                </span>
              </div>

              {/* 50th Percentile (Median - Highlighted) */}
              <div className="p-4 rounded-xl border-2 border-emerald-500 bg-emerald-50/40 text-center shadow-xs relative">
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-[10px] uppercase tracking-wider">
                  Market Median / Average
                </span>
                <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block mb-1 mt-1">
                  50th Percentile Benchmark
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold text-emerald-950">
                  {data.medianFormatted}
                </span>
                <span className="text-[11px] text-emerald-800 font-medium block mt-1">
                  Competitive target anchor
                </span>
              </div>

              {/* 75th / 90th Percentile */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-center">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  75th–90th Percentile (Top Tier)
                </span>
                <span className="text-xl sm:text-2xl font-extrabold text-slate-800">
                  {data.maxFormatted}
                </span>
                <span className="text-[11px] text-slate-500 block mt-1">
                  Top market performers &amp; tier-1 firms
                </span>
              </div>
            </div>

            {/* Visual Salary Bar Track */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>Lower Band: {data.minFormatted}</span>
                <span className="text-emerald-700 font-bold">
                  Median: {data.medianFormatted}
                </span>
                <span>Upper Band: {data.maxFormatted}</span>
              </div>

              <div className="relative h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div
                  className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-slate-400 via-emerald-500 to-indigo-600 rounded-full"
                  style={{ width: `${medianPercentage}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Negotiation Baseline</span>
                <span>Role: {salaryResult?.jobTitle} · Location: {salaryResult?.targetCountry}</span>
                <span>Top-of-Band Cap</span>
              </div>
            </div>

            {/* Breakdown & Market Context Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Bonuses, Equity & Top Paying Hubs */}
              <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                    <Coins className="w-3.5 h-3.5 text-amber-600" />
                    Additional Compensation &amp; Equity Structure
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {data.bonusAndEquity}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                    <MapPin className="w-3.5 h-3.5 text-rose-600" />
                    Top Paying Cities &amp; Tech Hubs ({salaryResult?.targetCountry})
                  </h4>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {data.topPayingHubs.map((hub, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white border border-slate-200 text-slate-800"
                      >
                        {hub}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Skills & Negotiation Guidance */}
              <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    Salary-Boosting Skills in High Demand
                  </h4>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {data.highDemandSkills.map((skill, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 border border-indigo-200 text-indigo-900"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                    Country Negotiation Strategy
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {data.negotiationTip}
                  </p>
                </div>
              </div>
            </div>

            {/* Market Demand Summary */}
            <div className="p-4 rounded-xl border border-slate-200 bg-emerald-50/30 text-xs text-slate-800 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Current Market Outlook for {salaryResult?.jobTitle}:</span>
              </div>
              <p className="leading-relaxed pl-5">{data.marketOutlook}</p>
            </div>

            {/* Google Search Grounding Sources & Citations */}
            {salaryResult?.sources && salaryResult.sources.length > 0 && (
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-blue-600" />
                    Verified Market Salary Sources &amp; Citations ({salaryResult.sources.length})
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Live Web Data via Google Search
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {salaryResult.sources.map((src, i) => (
                    <a
                      key={i}
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-blue-700 bg-blue-50/70 hover:bg-blue-100 border border-blue-200 transition-colors group"
                      title={src.title}
                    >
                      <span className="line-clamp-1 max-w-[200px]">{src.title}</span>
                      <ExternalLink className="w-3 h-3 text-blue-400 group-hover:text-blue-700 shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

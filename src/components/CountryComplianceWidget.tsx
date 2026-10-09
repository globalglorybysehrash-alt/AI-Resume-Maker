import React from 'react';
import { GLOBAL_COUNTRY_GUIDELINES } from '../data/countryGuidelinesData';
import { ResumeFormData } from '../types/resume';
import {
  Globe2,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldAlert,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface CountryComplianceWidgetProps {
  formData: ResumeFormData;
  setFormData: React.Dispatch<React.SetStateAction<ResumeFormData>>;
  onSelectTemplateById?: (templateId: string) => void;
}

export const CountryComplianceWidget: React.FC<CountryComplianceWidgetProps> = ({
  formData,
  setFormData,
  onSelectTemplateById,
}) => {
  const currentCountry = formData.countrySpecifics?.targetCountry || 'United States';
  const guideline =
    GLOBAL_COUNTRY_GUIDELINES.find((g) => g.country.toLowerCase().includes(currentCountry.toLowerCase())) ||
    GLOBAL_COUNTRY_GUIDELINES[0];

  const handleCountryChange = (countryName: string) => {
    const matched = GLOBAL_COUNTRY_GUIDELINES.find((g) => g.country === countryName) || GLOBAL_COUNTRY_GUIDELINES[0];
    const isPhotoBanned = matched.photoRule.includes('Forbidden');

    setFormData((prev) => ({
      ...prev,
      targetJob: {
        ...prev.targetJob,
        targetCountry: matched.country,
      },
      countrySpecifics: {
        targetCountry: matched.country,
        includePhoto: !isPhotoBanned && (matched.photoRule === 'Customary' || matched.photoRule === 'Mandatory'),
        includeDob: matched.country.includes('Germany'),
        includeNationality: matched.country.includes('UAE') || matched.country.includes('Singapore'),
        includeVisaStatus: matched.country.includes('UAE') || matched.country.includes('Australia') || matched.country.includes('Canada') || matched.country.includes('Singapore'),
        includeReferees: matched.country.includes('Australia') || matched.country.includes('United Kingdom'),
        includeSignatureDate: matched.country.includes('Germany'),
      },
    }));
  };

  // Run dynamic compliance check
  const warnings: string[] = [];
  const recommendations: string[] = [];

  // Check 1: Photo rules
  if (guideline.photoRule.includes('Forbidden')) {
    warnings.push(`Photo is prohibited in ${guideline.country} under anti-discrimination laws. Ensure no headshot is included to prevent automated rejection.`);
  } else if (guideline.photoRule === 'Customary') {
    recommendations.push(`A professional corporate headshot is standard practice in ${guideline.country} (used on >85% of resumes).`);
  }

  // Check 2: Visa status
  if ((guideline.country.includes('UAE') || guideline.country.includes('Australia') || guideline.country.includes('Canada') || guideline.country.includes('Singapore')) && !formData.contact.visaStatus) {
    recommendations.push(`Hiring managers in ${guideline.country} filter heavily by work authorization. Consider stating your visa/residency status in the header.`);
  }

  // Check 3: Notice period
  if ((guideline.country.includes('India') || guideline.country.includes('Singapore') || guideline.country.includes('UAE')) && !formData.contact.noticePeriod) {
    recommendations.push(`Notice period is a primary filter in ${guideline.country}. Stating "Immediate" or "30 Days Notice" boosts recruiter response rates.`);
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center font-bold text-sm">
            <Globe2 className="w-4 h-4 text-slate-700" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Target Country &amp; Compliance Checker</h3>
            <p className="text-xs text-slate-500">
              Ensure your career dossier adheres to local labor laws and recruiter expectations
            </p>
          </div>
        </div>

        {/* Country Selector Dropdown */}
        <div className="flex items-center gap-2">
          <label htmlFor="country-selector" className="text-xs font-semibold text-slate-600">
            Country:
          </label>
          <select
            id="country-selector"
            value={guideline.country}
            onChange={(e) => handleCountryChange(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
          >
            {GLOBAL_COUNTRY_GUIDELINES.map((c) => (
              <option key={c.code} value={c.country}>
                {c.flag} {c.country} ({c.documentTitle})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Country Specifications Brief */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-3.5 rounded-lg border border-slate-200">
        <div>
          <span className="text-slate-500 block text-[11px]">Format &amp; Standard</span>
          <span className="font-bold text-slate-900">{guideline.documentTitle}</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[11px]">Customary Length</span>
          <span className="font-bold text-slate-900">{guideline.customaryLength}</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[11px]">Photo Guideline</span>
          <span
            className={`font-bold inline-block px-1.5 py-0.5 rounded text-[11px] ${
              guideline.photoRule.includes('Forbidden')
                ? 'bg-rose-100 text-rose-800'
                : guideline.photoRule === 'Customary'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-slate-200 text-slate-800'
            }`}
          >
            {guideline.photoRule}
          </span>
        </div>
      </div>

      {/* Compliance Warnings & Reminders */}
      <div className="space-y-2 text-xs">
        {warnings.map((w, idx) => (
          <div key={idx} className="flex items-start gap-2 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{w}</span>
          </div>
        ))}

        {recommendations.map((r, idx) => (
          <div key={idx} className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-50/80 border border-amber-200 text-amber-900">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>{r}</span>
          </div>
        ))}
      </div>

      {/* Local Etiquette & Salary Tip */}
      <div className="pt-2 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-600">
        <div>
          <span className="font-bold text-slate-800 block mb-0.5">Local Interview Etiquette:</span>
          <p className="leading-relaxed text-[11px]">{guideline.interviewEtiquette}</p>
        </div>
        <div>
          <span className="font-bold text-slate-800 block mb-0.5">Salary Negotiation Tip:</span>
          <p className="leading-relaxed text-[11px]">{guideline.salaryNegotiationTip}</p>
        </div>
      </div>
    </div>
  );
};

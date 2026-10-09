import React, { useState } from 'react';
import {
  ResumeFormData,
  WorkExperienceItem,
  EducationItem,
  AchievementItem,
} from '../types/resume';
import { CountryComplianceWidget } from './CountryComplianceWidget';
import {
  User,
  FileText,
  Briefcase,
  GraduationCap,
  Wrench,
  Award,
  Target,
  Plus,
  Trash2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  AlertCircle,
  Loader2,
  UploadCloud,
  Globe2,
  Camera,
  Flag,
  Calendar,
  CheckCircle2,
} from 'lucide-react';

interface StepFormProps {
  formData: ResumeFormData;
  setFormData: React.Dispatch<React.SetStateAction<ResumeFormData>>;
  onGenerate: () => Promise<void>;
  isLoading: boolean;
  errorMessage: string | null;
  onLoadSample: () => void;
  onOpenUploadModal?: () => void;
  onOpenLinkedInModal?: () => void;
  onOpenTemplatesHub?: () => void;
  activeTemplateId?: string;
  onSelectTemplateById?: (templateId: string) => void;
}

const STEPS = [
  { id: 1, label: 'Contact', icon: User },
  { id: 2, label: 'Summary', icon: FileText },
  { id: 3, label: 'Experience', icon: Briefcase },
  { id: 4, label: 'Education', icon: GraduationCap },
  { id: 5, label: 'Skills', icon: Wrench },
  { id: 6, label: 'Achievements', icon: Award },
  { id: 7, label: 'Target Job', icon: Target },
];

export const StepForm: React.FC<StepFormProps> = ({
  formData,
  setFormData,
  onGenerate,
  isLoading,
  errorMessage,
  onLoadSample,
  onOpenUploadModal,
  onOpenLinkedInModal,
  onOpenTemplatesHub,
  activeTemplateId,
  onSelectTemplateById,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Helper updates
  const updateContact = (field: keyof ResumeFormData['contact'], value: string) => {
    setFormData((prev) => ({
      ...prev,
      contact: { ...prev.contact, [field]: value },
    }));
  };

  const updateSkills = (field: keyof ResumeFormData['skills'], value: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: { ...prev.skills, [field]: value },
    }));
  };

  const updateTargetJob = (field: keyof ResumeFormData['targetJob'], value: string) => {
    setFormData((prev) => ({
      ...prev,
      targetJob: { ...prev.targetJob, [field]: value },
    }));
  };

  // Experience Handlers
  const addExperience = () => {
    const newItem: WorkExperienceItem = {
      id: `exp-${Date.now()}`,
      role: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
      bulletPoints: [''],
    };
    setFormData((prev) => ({
      ...prev,
      experiences: [...prev.experiences, newItem],
    }));
  };

  const updateExperience = (id: string, field: keyof WorkExperienceItem, value: any) => {
    setFormData((prev) => ({
      ...prev,
      experiences: prev.experiences.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const removeExperience = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      experiences: prev.experiences.filter((item) => item.id !== id),
    }));
  };

  const addExperienceBullet = (expId: string) => {
    setFormData((prev) => ({
      ...prev,
      experiences: prev.experiences.map((exp) =>
        exp.id === expId ? { ...exp, bulletPoints: [...exp.bulletPoints, ''] } : exp
      ),
    }));
  };

  const updateExperienceBullet = (expId: string, index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      experiences: prev.experiences.map((exp) => {
        if (exp.id === expId) {
          const updated = [...exp.bulletPoints];
          updated[index] = value;
          return { ...exp, bulletPoints: updated };
        }
        return exp;
      }),
    }));
  };

  const removeExperienceBullet = (expId: string, index: number) => {
    setFormData((prev) => ({
      ...prev,
      experiences: prev.experiences.map((exp) => {
        if (exp.id === expId) {
          const updated = exp.bulletPoints.filter((_, i) => i !== index);
          return { ...exp, bulletPoints: updated.length > 0 ? updated : [''] };
        }
        return exp;
      }),
    }));
  };

  // Education Handlers
  const addEducation = () => {
    const newItem: EducationItem = {
      id: `edu-${Date.now()}`,
      institution: '',
      degree: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: '',
      honors: '',
    };
    setFormData((prev) => ({
      ...prev,
      education: [...prev.education, newItem],
    }));
  };

  const updateEducation = (id: string, field: keyof EducationItem, value: string) => {
    setFormData((prev) => ({
      ...prev,
      education: prev.education.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const removeEducation = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      education: prev.education.filter((item) => item.id !== id),
    }));
  };

  // Achievement Handlers
  const addAchievement = () => {
    const newItem: AchievementItem = {
      id: `ach-${Date.now()}`,
      title: '',
      organization: '',
      year: '',
      description: '',
    };
    setFormData((prev) => ({
      ...prev,
      achievements: [...prev.achievements, newItem],
    }));
  };

  const updateAchievement = (id: string, field: keyof AchievementItem, value: string) => {
    setFormData((prev) => ({
      ...prev,
      achievements: prev.achievements.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const removeAchievement = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      achievements: prev.achievements.filter((item) => item.id !== id),
    }));
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Quick Intake Actions & Template Integration Toolbar */}
      <div className="mb-6 p-4 rounded-xl border border-slate-200 bg-white shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {onOpenLinkedInModal && (
            <button
              type="button"
              onClick={onOpenLinkedInModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#0A66C2] hover:bg-[#004182] rounded-lg transition-colors shadow-2xs"
              title="Connect with LinkedIn to auto-pull your verified profile data"
            >
              <span className="font-bold text-[10px] bg-white text-[#0A66C2] w-3.5 h-3.5 rounded flex items-center justify-center">
                in
              </span>
              <span>Connect with LinkedIn</span>
            </button>
          )}

          {onOpenUploadModal && (
            <button
              type="button"
              onClick={onOpenUploadModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors shadow-2xs"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              Direct Upload (JSON / Text)
            </button>
          )}
          {onOpenTemplatesHub && (
            <button
              type="button"
              onClick={onOpenTemplatesHub}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors"
            >
              <Globe2 className="w-3.5 h-3.5 text-slate-700" />
              50 Country Templates
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={onLoadSample}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          Load Sample Profile
        </button>
      </div>

      {/* Fact Preservation & Integrity Banner */}
      <div className="mb-6 p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            <span className="font-semibold text-slate-900">Book Kaaro Fact Integrity Promise:</span>{' '}
            We never invent past employers, fake credentials, or fabricated metrics. Everything generated is
            grounded strictly in the details you provide below. Missing metrics or dates are highlighted as editable
            placeholders.
          </div>
        </div>
      </div>

      {/* Step Navigation Bar */}
      <div className="mb-8 overflow-x-auto pb-2">
        <nav aria-label="Form Progress" className="flex items-center justify-between min-w-[560px] gap-2">
          {STEPS.map((s) => {
            const Icon = s.icon;
            const isActive = currentStep === s.id;
            const isCompleted = currentStep > s.id;

            return (
              <button
                key={s.id}
                onClick={() => setCurrentStep(s.id)}
                className={`flex items-center gap-2 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : isCompleted
                    ? 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isActive ? 'bg-white text-slate-900' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {s.id}
                </span>
                <span className="whitespace-nowrap">{s.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Error Message Alert */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl border border-rose-200 bg-rose-50 flex items-start gap-3 text-rose-800 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Unable to process document</p>
            <p className="text-xs sm:text-sm mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Form Content Area */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs">
        {/* Step 1: Contact Information */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">1. Contact &amp; Header Information</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Your standard contact info. Ensure your full name and email are accurate.
                </p>
              </div>

              {onOpenLinkedInModal && (
                <button
                  type="button"
                  onClick={onOpenLinkedInModal}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#0A66C2] hover:bg-[#004182] rounded-lg transition-colors shadow-2xs shrink-0 self-start sm:self-auto"
                  title="Auto-fill form with your LinkedIn profile details"
                >
                  <span className="font-bold text-[10px] bg-white text-[#0A66C2] w-3.5 h-3.5 rounded flex items-center justify-center">
                    in
                  </span>
                  <span>Connect with LinkedIn</span>
                </button>
              )}
            </div>

            {/* Embedded Country Compliance & Guidelines Assistant */}
            <CountryComplianceWidget
              formData={formData}
              setFormData={setFormData}
              onSelectTemplateById={onSelectTemplateById}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.contact.fullName}
                  onChange={(e) => updateContact('fullName', e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Professional Headline / Target Role
                </label>
                <input
                  type="text"
                  value={formData.contact.headline}
                  onChange={(e) => updateContact('headline', e.target.value)}
                  placeholder="e.g. Senior Full-Stack Engineer"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.contact.email}
                  onChange={(e) => updateContact('email', e.target.value)}
                  placeholder="e.g. alex@example.com"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.contact.phone}
                  onChange={(e) => updateContact('phone', e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Location (City, Country / State)
                </label>
                <input
                  type="text"
                  value={formData.contact.location}
                  onChange={(e) => updateContact('location', e.target.value)}
                  placeholder="e.g. Bengaluru, India or Remote"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  LinkedIn URL
                </label>
                <input
                  type="text"
                  value={formData.contact.linkedin}
                  onChange={(e) => updateContact('linkedin', e.target.value)}
                  placeholder="e.g. linkedin.com/in/username"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Portfolio / GitHub / Website
                </label>
                <input
                  type="text"
                  value={formData.contact.website}
                  onChange={(e) => updateContact('website', e.target.value)}
                  placeholder="e.g. github.com/username or yourportfolio.dev"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                />
              </div>

              {/* Country-Specific Customary / Mandatory Fields */}
              {formData.countrySpecifics?.includeNationality && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Flag className="w-3.5 h-3.5 text-blue-600" />
                    Nationality (Customary in UAE / Gulf / Singapore)
                  </label>
                  <input
                    type="text"
                    value={formData.contact.nationality || ''}
                    onChange={(e) => updateContact('nationality', e.target.value)}
                    placeholder="e.g. Indian, British, Australian"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-blue-200 bg-blue-50/30 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>
              )}

              {formData.countrySpecifics?.includeVisaStatus && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Visa Status / Work Authorization (Canada / UAE / Australia)
                  </label>
                  <input
                    type="text"
                    value={formData.contact.visaStatus || ''}
                    onChange={(e) => updateContact('visaStatus', e.target.value)}
                    placeholder="e.g. Citizen / Permanent Resident / Employment Visa / Open Work Permit"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-emerald-200 bg-emerald-50/30 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                  />
                </div>
              )}

              {formData.countrySpecifics?.includeDob && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-600" />
                    Date / Place of Birth (Customary in Germany / DACH / Japan)
                  </label>
                  <input
                    type="text"
                    value={formData.contact.dateOfBirth || ''}
                    onChange={(e) => updateContact('dateOfBirth', e.target.value)}
                    placeholder="e.g. 14 March 1994, Berlin"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-amber-200 bg-amber-50/30 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                  />
                </div>
              )}

              {/* Optional Profile Photo / Headshot */}
              <div className="sm:col-span-2 p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-2xs shrink-0">
                      <Camera className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-900">
                        Profile Photo / Headshot <span className="font-normal text-slate-500">(Optional)</span>
                      </label>
                      <span className="text-[11px] text-slate-500 block">
                        Add an image to your CV. Not required for US/UK/Canada ATS. Standard in Germany, UAE, and Japan.
                      </span>
                    </div>
                  </div>
                  {formData.contact.photoUrl && (
                    <button
                      type="button"
                      onClick={() => updateContact('photoUrl', '')}
                      className="text-xs text-rose-600 hover:text-rose-800 font-semibold self-start sm:self-auto"
                    >
                      Remove Photo
                    </button>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
                  {formData.contact.photoUrl ? (
                    <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-emerald-500 shadow-xs shrink-0 bg-white">
                        <img
                          src={formData.contact.photoUrl}
                          alt="Candidate Headshot"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-xs text-slate-700 space-y-0.5">
                        <div className="flex items-center gap-1 font-semibold text-emerald-700">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Photo Attached</span>
                        </div>
                        <p className="text-[11px] text-slate-500">Will be displayed on your CV header</p>
                      </div>
                    </div>
                  ) : null}

                  <div className="flex-1 w-full space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-white hover:bg-indigo-50 border border-indigo-200 rounded-lg shadow-2xs transition-colors">
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>Upload Photo File</span>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/jpg"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = () => {
                                if (typeof reader.result === 'string') {
                                  updateContact('photoUrl', reader.result);
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                      <span className="text-[11px] text-slate-400">or enter image web URL:</span>
                    </div>

                    <input
                      type="url"
                      value={formData.contact.photoUrl || ''}
                      onChange={(e) => updateContact('photoUrl', e.target.value)}
                      placeholder="https://example.com/photo.jpg or data URL"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Summary */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">2. Professional Summary</h2>
              <p className="text-xs text-slate-500 mt-1">
                Provide a 2–4 sentence summary of your career focus, core competencies, and primary domain strengths.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Career Summary Statement
              </label>
              <textarea
                rows={5}
                value={formData.summary}
                onChange={(e) => setFormData((prev) => ({ ...prev, summary: e.target.value }))}
                placeholder="e.g. Full-stack software engineer with 6+ years building resilient web services and distributed systems. Specialist in React, TypeScript, and microservice architecture..."
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent leading-relaxed"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Tip: Keep it authentic. You can leave this blank if you prefer the AI to construct an honest summary
                based on your work experience in the next step.
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Work Experience */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">3. Work Experience</h2>
                <p className="text-xs text-slate-500 mt-1">
                  List your verified roles in reverse-chronological order.
                </p>
              </div>
              <button
                type="button"
                onClick={addExperience}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Position
              </button>
            </div>

            {formData.experiences.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-slate-300 rounded-lg">
                <Briefcase className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-700">No work experience entries added yet</p>
                <p className="text-xs text-slate-500 mt-1">Add your internships or full-time roles.</p>
                <button
                  type="button"
                  onClick={addExperience}
                  className="mt-3 px-3.5 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded-md"
                >
                  Add First Role
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {formData.experiences.map((exp, index) => (
                  <div
                    key={exp.id}
                    className="p-5 border border-slate-200 rounded-xl bg-slate-50/50 space-y-4 relative"
                  >
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Position #{index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeExperience(exp.id)}
                        className="text-slate-400 hover:text-red-600 transition-colors p-1"
                        title="Remove role"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Job Title / Role
                        </label>
                        <input
                          type="text"
                          value={exp.role}
                          onChange={(e) => updateExperience(exp.id, 'role', e.target.value)}
                          placeholder="e.g. Senior Software Engineer"
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Company / Organization
                        </label>
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                          placeholder="e.g. Zenith Cloud"
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Location
                        </label>
                        <input
                          type="text"
                          value={exp.location}
                          onChange={(e) => updateExperience(exp.id, 'location', e.target.value)}
                          placeholder="e.g. Bengaluru, India or Remote"
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Start Date
                          </label>
                          <input
                            type="text"
                            value={exp.startDate}
                            onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                            placeholder="e.g. July 2022"
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            End Date
                          </label>
                          <input
                            type="text"
                            disabled={exp.isCurrent}
                            value={exp.isCurrent ? 'Present' : exp.endDate}
                            onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                            placeholder="e.g. Present or Dec 2024"
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 disabled:bg-slate-100 disabled:text-slate-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`current-${exp.id}`}
                        checked={exp.isCurrent}
                        onChange={(e) => {
                          updateExperience(exp.id, 'isCurrent', e.target.checked);
                          if (e.target.checked) {
                            updateExperience(exp.id, 'endDate', 'Present');
                          }
                        }}
                        className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                      />
                      <label htmlFor={`current-${exp.id}`} className="text-xs text-slate-700 font-medium">
                        I currently work here
                      </label>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-semibold text-slate-700">
                          Responsibilities &amp; Achievements (Bullet points)
                        </label>
                        <button
                          type="button"
                          onClick={() => addExperienceBullet(exp.id)}
                          className="text-xs text-slate-700 hover:text-slate-900 font-medium inline-flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" /> Add bullet
                        </button>
                      </div>

                      <div className="space-y-2">
                        {exp.bulletPoints.map((bullet, bIdx) => (
                          <div key={bIdx} className="flex items-start gap-2">
                            <span className="text-slate-400 mt-2 text-xs">•</span>
                            <textarea
                              rows={2}
                              value={bullet}
                              onChange={(e) => updateExperienceBullet(exp.id, bIdx, e.target.value)}
                              placeholder="e.g. Built high-concurrency microservices reducing p99 response times by 35%..."
                              className="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                            />
                            {exp.bulletPoints.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeExperienceBullet(exp.id, bIdx)}
                                className="text-slate-400 hover:text-red-500 p-1 mt-1"
                                title="Remove bullet"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 4: Education */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">4. Education &amp; Degrees</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Add your formal degrees, diplomas, or academic qualifications.
                </p>
              </div>
              <button
                type="button"
                onClick={addEducation}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Degree
              </button>
            </div>

            {formData.education.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-slate-300 rounded-lg">
                <GraduationCap className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-700">No education entries added yet</p>
                <button
                  type="button"
                  onClick={addEducation}
                  className="mt-3 px-3.5 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded-md"
                >
                  Add Degree
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.education.map((edu, idx) => (
                  <div
                    key={edu.id}
                    className="p-5 border border-slate-200 rounded-xl bg-slate-50/50 space-y-4"
                  >
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Education #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeEducation(edu.id)}
                        className="text-slate-400 hover:text-red-600 transition-colors p-1"
                        title="Remove education"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Institution / University
                        </label>
                        <input
                          type="text"
                          value={edu.institution}
                          onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                          placeholder="e.g. National Institute of Technology"
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Degree / Credential
                        </label>
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                          placeholder="e.g. B.Tech or Bachelor of Science"
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Field of Study / Major
                        </label>
                        <input
                          type="text"
                          value={edu.fieldOfStudy}
                          onChange={(e) => updateEducation(edu.id, 'fieldOfStudy', e.target.value)}
                          placeholder="e.g. Computer Science &amp; Engineering"
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Graduation Year / Dates
                          </label>
                          <input
                            type="text"
                            value={edu.endDate}
                            onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)}
                            placeholder="e.g. 2019"
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Honors / GPA (Optional)
                          </label>
                          <input
                            type="text"
                            value={edu.honors}
                            onChange={(e) => updateEducation(edu.id, 'honors', e.target.value)}
                            placeholder="e.g. First Class"
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 5: Skills */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">5. Skills &amp; Competencies</h2>
              <p className="text-xs text-slate-500 mt-1">
                Enter your verified technical languages, core tools, and professional competencies.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Technical Skills &amp; Languages (Comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.skills.technical}
                  onChange={(e) => updateSkills('technical', e.target.value)}
                  placeholder="e.g. TypeScript, React, Node.js, PostgreSQL, GraphQL, Python"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tools, Frameworks &amp; Cloud (Comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.skills.tools}
                  onChange={(e) => updateSkills('tools', e.target.value)}
                  placeholder="e.g. Git, Docker, AWS (S3, ECS), Vite, Jest, Postman, Linux"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Soft Skills &amp; Leadership (Comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.skills.soft}
                  onChange={(e) => updateSkills('soft', e.target.value)}
                  placeholder="e.g. Technical Leadership, Mentorship, Cross-Functional Alignment, System Design"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Achievements */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">6. Achievements &amp; Certifications</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Add verified awards, hackathon wins, published articles, or industry certifications.
                </p>
              </div>
              <button
                type="button"
                onClick={addAchievement}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Achievement
              </button>
            </div>

            {formData.achievements.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-slate-300 rounded-lg">
                <Award className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-700">No achievements or certifications listed</p>
                <p className="text-xs text-slate-500 mt-1">This section is optional but strengthens your profile.</p>
                <button
                  type="button"
                  onClick={addAchievement}
                  className="mt-3 px-3.5 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded-md"
                >
                  Add Award / Certification
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.achievements.map((ach) => (
                  <div
                    key={ach.id}
                    className="p-5 border border-slate-200 rounded-xl bg-slate-50/50 space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <span className="text-xs font-bold text-slate-800">Honor / Certification</span>
                      <button
                        type="button"
                        onClick={() => removeAchievement(ach.id)}
                        className="text-slate-400 hover:text-red-600 transition-colors p-1"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Title / Certification Name
                        </label>
                        <input
                          type="text"
                          value={ach.title}
                          onChange={(e) => updateAchievement(ach.id, 'title', e.target.value)}
                          placeholder="e.g. AWS Certified Solutions Architect"
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Year Received
                        </label>
                        <input
                          type="text"
                          value={ach.year}
                          onChange={(e) => updateAchievement(ach.id, 'year', e.target.value)}
                          placeholder="e.g. 2023"
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Issuing Organization &amp; Context
                      </label>
                      <input
                        type="text"
                        value={ach.description}
                        onChange={(e) => updateAchievement(ach.id, 'description', e.target.value)}
                        placeholder="e.g. Amazon Web Services - Validation ID: AWS-892419"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 7: Target Job */}
        {currentStep === 7 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">7. Target Job &amp; Tailoring (Optional)</h2>
              <p className="text-xs text-slate-500 mt-1">
                Provide details of the role you are applying to. Book Kaaro AI will match your real background to this
                job and generate your tailored cover letter and interview questions without inventing fake credentials.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Job Title
                </label>
                <input
                  type="text"
                  value={formData.targetJob.title}
                  onChange={(e) => updateTargetJob('title', e.target.value)}
                  placeholder="e.g. Lead Platform Engineer"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Company Name
                </label>
                <input
                  type="text"
                  value={formData.targetJob.company}
                  onChange={(e) => updateTargetJob('company', e.target.value)}
                  placeholder="e.g. Book Kaaro Technologies"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Hiring Manager Name or Team (Optional)
                </label>
                <input
                  type="text"
                  value={formData.targetJob.hiringManager}
                  onChange={(e) => updateTargetJob('hiringManager', e.target.value)}
                  placeholder="e.g. Engineering Hiring Team"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Job Description / Role Requirements
                </label>
                <textarea
                  rows={6}
                  value={formData.targetJob.jobDescription}
                  onChange={(e) => updateTargetJob('jobDescription', e.target.value)}
                  placeholder="Paste the target job description or requirements here..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 leading-relaxed"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step Navigation Controls */}
        <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 1))}
                className="inline-flex items-center justify-center gap-1 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors w-full sm:w-auto"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Previous
              </button>
            )}

            <button
              type="button"
              onClick={onLoadSample}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors w-full sm:w-auto"
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-500" />
              Fill Sample Profile
            </button>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {currentStep < 7 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => Math.min(prev + 1, 7))}
                className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors w-full sm:w-auto"
              >
                Continue <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onGenerate}
                disabled={isLoading || !formData.contact.fullName.trim()}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-400 rounded-lg transition-all shadow-sm w-full sm:w-auto focus-visible:ring-2 focus-visible:ring-emerald-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating Documents with Gemini...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-emerald-200" />
                    Generate Resume &amp; Cover Letter
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

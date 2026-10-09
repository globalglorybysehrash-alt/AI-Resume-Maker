export interface ContactInfo {
  fullName: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  website: string;
  github: string;
  // Country specific optional fields
  nationality?: string;
  visaStatus?: string;
  dateOfBirth?: string;
  photoUrl?: string;
  noticePeriod?: string;
}

export interface WorkExperienceItem {
  id: string;
  role: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  bulletPoints: string[];
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  honors: string;
}

export interface AchievementItem {
  id: string;
  title: string;
  organization: string;
  year: string;
  description: string;
}

export interface ResumeFormData {
  contact: ContactInfo;
  summary: string;
  experiences: WorkExperienceItem[];
  education: EducationItem[];
  skills: {
    technical: string;
    soft: string;
    tools: string;
  };
  achievements: AchievementItem[];
  targetJob: {
    title: string;
    company: string;
    jobDescription: string;
    hiringManager: string;
    targetCountry?: string;
  };
  countrySpecifics?: {
    targetCountry: string;
    includePhoto: boolean;
    includeDob: boolean;
    includeNationality: boolean;
    includeVisaStatus: boolean;
    includeReferees: boolean;
    includeSignatureDate: boolean;
  };
}

export interface GeneratedResumeData {
  header: {
    fullName: string;
    headline: string;
    email: string;
    phone: string;
    location: string;
    links: string[];
    nationality?: string;
    visaStatus?: string;
    dateOfBirth?: string;
    photoUrl?: string;
  };
  summary: string;
  skills: {
    categoryName: string;
    items: string[];
  }[];
  experience: {
    role: string;
    company: string;
    location: string;
    dates: string;
    bullets: string[];
  }[];
  education: {
    institution: string;
    degree: string;
    dates: string;
    details: string;
  }[];
  achievements: {
    title: string;
    organization: string;
    year: string;
    description: string;
  }[];
  factPreservationNotes: string[];
  countryNotes?: string[];
  templateId?: string;
}

export interface GeneratedCoverLetterData {
  senderInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
  };
  recipientInfo: {
    managerName: string;
    companyName: string;
    roleTitle: string;
  };
  date: string;
  salutation: string;
  openingParagraph: string;
  bodyParagraphs: string[];
  closingParagraph: string;
  signoff: string;
  postscript?: string;
  countryStyle?: string;
}

export interface InterviewQuestionItem {
  id: string;
  question: string;
  category: 'behavioral' | 'technical' | 'situational' | 'leadership';
  context: string;
  starFramework: {
    situation: string;
    task: string;
    action: string;
    result: string;
  };
  pitfallWarning: string;
}

export interface GenerationResult {
  resume: GeneratedResumeData;
  coverLetter: GeneratedCoverLetterData;
  interviewQuestions: InterviewQuestionItem[];
  timestamp: string;
}

export interface MarketplaceItem {
  id: string;
  title: string;
  category: string;
  description: string;
  badge: string;
  tags: string[];
  imagePath: string;
  isPlaceholder: boolean;
  priceNote: string;
  features: string[];
}

export type TemplateLayoutStyle =
  | 'classic-ats'
  | 'modern-split'
  | 'silicon-valley'
  | 'dach-lebenslauf'
  | 'europass-clean'
  | 'executive-serif'
  | 'nordic-minimalist'
  | 'uk-standard'
  | 'tokyo-structured'
  | 'dubai-executive'
  | 'creative-accent'
  | 'canadian-bilingual';

export interface ResumeTemplateMeta {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  flag: string;
  category: 'North America' | 'Europe' | 'Asia Pacific' | 'Middle East' | 'Global & Remote' | 'Executive & Specialty';
  layoutStyle: TemplateLayoutStyle;
  viralScore: number; // e.g. 98%
  recommendedPages: string; // e.g. "1 Page Strict" or "2 Pages"
  photoRule: 'Forbidden' | 'Optional' | 'Customary' | 'Mandatory';
  description: string;
  features: string[];
  countrySpecs: {
    formatName: string;
    photoGuideline: string;
    lengthGuideline: string;
    prohibitedInfo: string[];
    mandatoryCustomaryInfo: string[];
    localTips: string;
  };
}

export interface JobBoardPortal {
  id: string;
  name: string;
  category: 'Global' | 'Remote / Tech' | 'USA / Canada' | 'UK & Ireland' | 'Europe & DACH' | 'Asia Pacific' | 'Middle East & Gulf';
  url: string;
  logoText: string;
  description: string;
  featuredCountries: string[];
  searchQueryTemplate: string; // e.g. "https://www.linkedin.com/jobs/search/?keywords={role}&location={country}"
  hasDirectUpload: boolean;
  tags: string[];
}

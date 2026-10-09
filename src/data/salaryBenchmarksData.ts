export interface SalaryDataResult {
  currency: string;
  currencySymbol: string;
  period: string;
  minSalary: number;
  medianSalary: number;
  maxSalary: number;
  minFormatted: string;
  medianFormatted: string;
  maxFormatted: string;
  bonusAndEquity: string;
  topPayingHubs: string[];
  highDemandSkills: string[];
  marketOutlook: string;
  negotiationTip: string;
}

export interface SalarySearchResponse {
  success: boolean;
  jobTitle: string;
  targetCountry: string;
  experienceLevel: string;
  salaryData: SalaryDataResult;
  sources: { title: string; url: string }[];
  groundedWithGoogleSearch: boolean;
  timestamp: string;
}

/**
 * Country-specific baseline benchmarks for popular regions
 */
export function getFallbackSalaryData(
  role: string,
  country: string,
  level: string
): { salaryData: SalaryDataResult; sources: { title: string; url: string }[] } {
  const c = country.toLowerCase();
  const lvl = level.toLowerCase();
  const isSenior = lvl.includes('senior') || lvl.includes('lead') || lvl.includes('principal') || lvl.includes('6-9') || lvl.includes('10+');
  const isEntry = lvl.includes('entry') || lvl.includes('0-2');

  // Baseline multiplier
  const multiplier = isSenior ? 1.45 : isEntry ? 0.72 : 1.0;

  if (c.includes('united states') || c.includes('usa') || c.includes('us')) {
    const baseMedian = 155000 * multiplier;
    return {
      salaryData: {
        currency: 'USD',
        currencySymbol: '$',
        period: 'per year',
        minSalary: Math.round(baseMedian * 0.8),
        medianSalary: Math.round(baseMedian),
        maxSalary: Math.round(baseMedian * 1.3),
        minFormatted: `$${Math.round(baseMedian * 0.8 / 1000)}k / yr`,
        medianFormatted: `$${Math.round(baseMedian / 1000)}k / yr`,
        maxFormatted: `$${Math.round(baseMedian * 1.3 / 1000)}k / yr`,
        bonusAndEquity: '10%–20% annual performance bonus + $25k–$75k equity/RSUs',
        topPayingHubs: ['San Francisco Bay Area, CA', 'New York City, NY', 'Seattle, WA', 'Austin, TX', 'Boston, MA'],
        highDemandSkills: ['Distributed Systems', 'Cloud Infrastructure (AWS/GCP)', 'TypeScript / Next.js', 'AI/LLM Fine-Tuning'],
        marketOutlook: 'High demand for specialized senior talent with verifiable business impact metrics.',
        negotiationTip: 'Negotiate total compensation (base + sign-on bonus + equity vesting schedule) rather than base salary alone.',
      },
      sources: [
        { title: 'Levels.fyi Real-Time Verified Compensation', url: 'https://www.levels.fyi' },
        { title: 'Bureau of Labor Statistics (BLS.gov)', url: 'https://www.bls.gov' },
        { title: 'Glassdoor Salary Explorer', url: 'https://www.glassdoor.com/Salaries' },
      ],
    };
  }

  if (c.includes('united kingdom') || c.includes('uk') || c.includes('london')) {
    const baseMedian = 85000 * multiplier;
    return {
      salaryData: {
        currency: 'GBP',
        currencySymbol: '£',
        period: 'per year',
        minSalary: Math.round(baseMedian * 0.82),
        medianSalary: Math.round(baseMedian),
        maxSalary: Math.round(baseMedian * 1.35),
        minFormatted: `£${Math.round(baseMedian * 0.82 / 1000)}k / yr`,
        medianFormatted: `£${Math.round(baseMedian / 1000)}k / yr`,
        maxFormatted: `£${Math.round(baseMedian * 1.35 / 1000)}k / yr`,
        bonusAndEquity: '8%–15% annual bonus + employer pension contribution up to 10%',
        topPayingHubs: ['London (City & Canary Wharf)', 'Cambridge', 'Bristol', 'Manchester', 'Edinburgh'],
        highDemandSkills: ['Microservices Architecture', 'Kubernetes & Terraform', 'React & TypeScript', 'Financial Tech APIs'],
        marketOutlook: 'Fintech, defense tech, and healthtech lead hiring across the UK with strong demand for hybrid roles.',
        negotiationTip: 'In the UK, pension match matching and private medical insurance (PMI) are valuable negotiation levers.',
      },
      sources: [
        { title: 'Reed UK Salary Directory', url: 'https://www.reed.co.uk' },
        { title: 'Levels.fyi United Kingdom Hub', url: 'https://www.levels.fyi/locations/gb/united-kingdom' },
        { title: 'Totaljobs UK Market Insights', url: 'https://www.totaljobs.com' },
      ],
    };
  }

  if (c.includes('germany') || c.includes('deutschland') || c.includes('dach')) {
    const baseMedian = 88000 * multiplier;
    return {
      salaryData: {
        currency: 'EUR',
        currencySymbol: '€',
        period: 'per year',
        minSalary: Math.round(baseMedian * 0.82),
        medianSalary: Math.round(baseMedian),
        maxSalary: Math.round(baseMedian * 1.28),
        minFormatted: `€${Math.round(baseMedian * 0.82 / 1000)}k / yr`,
        medianFormatted: `€${Math.round(baseMedian / 1000)}k / yr`,
        maxFormatted: `€${Math.round(baseMedian * 1.28 / 1000)}k / yr`,
        bonusAndEquity: '13th-month salary (Weihnachtsgeld) + 30 days paid vacation + mobility allowance',
        topPayingHubs: ['Munich (München)', 'Frankfurt am Main', 'Berlin', 'Stuttgart', 'Hamburg'],
        highDemandSkills: ['Automotive Embedded / IoT', 'Cloud Native & Docker', 'Enterprise Java / Go', 'Data Privacy & ISO Compliance'],
        marketOutlook: 'German engineering firms actively sponsor EU Blue Cards for skilled STEM and tech professionals.',
        negotiationTip: 'Clarify whether compensation is 12 or 13 monthly installments (Gehalt) and request company car or public transit ticket (Deutschlandticket).',
      },
      sources: [
        { title: 'StepStone Gehaltsplaner Deutschland', url: 'https://www.stepstone.de/gehalt' },
        { title: 'Kununu Salary Check DACH', url: 'https://www.kununu.com/gehalt' },
        { title: 'Levels.fyi Germany Hub', url: 'https://www.levels.fyi/locations/de/germany' },
      ],
    };
  }

  if (c.includes('united arab emirates') || c.includes('uae') || c.includes('dubai') || c.includes('abu dhabi')) {
    const baseMedian = 32000 * multiplier;
    return {
      salaryData: {
        currency: 'AED',
        currencySymbol: 'AED ',
        period: 'per month',
        minSalary: Math.round(baseMedian * 0.8),
        medianSalary: Math.round(baseMedian),
        maxSalary: Math.round(baseMedian * 1.4),
        minFormatted: `AED ${Math.round(baseMedian * 0.8).toLocaleString()} / mo (Tax-Free)`,
        medianFormatted: `AED ${Math.round(baseMedian).toLocaleString()} / mo (Tax-Free)`,
        maxFormatted: `AED ${Math.round(baseMedian * 1.4).toLocaleString()} / mo (Tax-Free)`,
        bonusAndEquity: '0% personal income tax + End of Service Gratuity + family medical insurance + annual flight tickets',
        topPayingHubs: ['Dubai Internet City / DIFC', 'Abu Dhabi ADGM', 'Sharjah Research Technology Park'],
        highDemandSkills: ['Fintech & Payment Gateways', 'Cloud Engineering', 'AI & Automation', 'Mobile (React Native/Flutter)'],
        marketOutlook: 'Booming tech ecosystem with Golden Visa incentives attracting global senior talent.',
        negotiationTip: 'In the UAE, negotiate your housing allowance (40% of package) and children education allowances in the contract.',
      },
      sources: [
        { title: 'Bayt Middle East Salary Benchmark', url: 'https://www.bayt.com/en/salaries' },
        { title: 'GulfTalent UAE Market Survey', url: 'https://www.gulftalent.com' },
        { title: 'Cooper Fitch UAE Salary Guide', url: 'https://cooperfitch.com' },
      ],
    };
  }

  if (c.includes('canada') || c.includes('toronto') || c.includes('vancouver')) {
    const baseMedian = 125000 * multiplier;
    return {
      salaryData: {
        currency: 'CAD',
        currencySymbol: 'CA$',
        period: 'per year',
        minSalary: Math.round(baseMedian * 0.82),
        medianSalary: Math.round(baseMedian),
        maxSalary: Math.round(baseMedian * 1.3),
        minFormatted: `CA$${Math.round(baseMedian * 0.82 / 1000)}k / yr`,
        medianFormatted: `CA$${Math.round(baseMedian / 1000)}k / yr`,
        maxFormatted: `CA$${Math.round(baseMedian * 1.3 / 1000)}k / yr`,
        bonusAndEquity: '8%–15% annual bonus + RRSP employer matching + extended health coverage',
        topPayingHubs: ['Toronto (Waterloo Tech Corridor)', 'Vancouver, BC', 'Montreal, QC', 'Ottawa', 'Calgary'],
        highDemandSkills: ['AI / ML Systems', 'Full Stack TypeScript', 'Kubernetes & DevSecOps', 'Data Engineering'],
        marketOutlook: 'Robust tech sector with major US technology hubs operating Canadian satellite centers.',
        negotiationTip: 'Ask for RRSP matching percentage and remote work equipment / wellness stipend.',
      },
      sources: [
        { title: 'Job Bank Canada Wage Report', url: 'https://www.jobbank.gc.ca/trend-analysis/search-wages' },
        { title: 'Levels.fyi Canada Hub', url: 'https://www.levels.fyi/locations/ca/canada' },
        { title: 'Indeed Canada Salary Tool', url: 'https://ca.indeed.com/career/salaries' },
      ],
    };
  }

  if (c.includes('australia') || c.includes('sydney') || c.includes('melbourne')) {
    const baseMedian = 145000 * multiplier;
    return {
      salaryData: {
        currency: 'AUD',
        currencySymbol: 'AU$',
        period: 'per year',
        minSalary: Math.round(baseMedian * 0.82),
        medianSalary: Math.round(baseMedian),
        maxSalary: Math.round(baseMedian * 1.32),
        minFormatted: `AU$${Math.round(baseMedian * 0.82 / 1000)}k / yr`,
        medianFormatted: `AU$${Math.round(baseMedian / 1000)}k / yr`,
        maxFormatted: `AU$${Math.round(baseMedian * 1.32 / 1000)}k / yr`,
        bonusAndEquity: '+ 11.5% Mandatory Superannuation guarantee + performance bonus',
        topPayingHubs: ['Sydney, NSW', 'Melbourne, VIC', 'Brisbane, QLD', 'Perth, WA'],
        highDemandSkills: ['Cloud Infrastructure (AWS/Azure)', 'Modern React & Node.js', 'Cybersecurity & IAM', 'Agile Product Delivery'],
        marketOutlook: 'Strong demand for tech talent across finance, healthcare, and government digital transformations.',
        negotiationTip: 'Always verify if quoted figures are "inclusive of Superannuation" or "base + 11.5% Super" (the difference is thousands of dollars).',
      },
      sources: [
        { title: 'SEEK Australia Salary Insights', url: 'https://www.seek.com.au/career-advice/explore-salaries' },
        { title: 'Hays Australia Salary Guide', url: 'https://www.hays.com.au' },
        { title: 'Levels.fyi Australia Hub', url: 'https://www.levels.fyi/locations/au/australia' },
      ],
    };
  }

  if (c.includes('singapore')) {
    const baseMedian = 110000 * multiplier;
    return {
      salaryData: {
        currency: 'SGD',
        currencySymbol: 'S$',
        period: 'per year',
        minSalary: Math.round(baseMedian * 0.8),
        medianSalary: Math.round(baseMedian),
        maxSalary: Math.round(baseMedian * 1.35),
        minFormatted: `S$${Math.round(baseMedian * 0.8 / 1000)}k / yr`,
        medianFormatted: `S$${Math.round(baseMedian / 1000)}k / yr`,
        maxFormatted: `S$${Math.round(baseMedian * 1.35 / 1000)}k / yr`,
        bonusAndEquity: 'AWS (Annual Wage Supplement / 13th month) + 1-3 months performance bonus + CPF contribution for PRs/Citizens',
        topPayingHubs: ['Marina Bay Financial Centre', 'One-North Tech Hub', 'Raffles Place'],
        highDemandSkills: ['Fintech & Blockchain', 'Data Science & Machine Learning', 'Cloud Architecture', 'Golang & Java'],
        marketOutlook: 'Southeast Asia headquarters for global multinational corporations and regional unicorns.',
        negotiationTip: 'Negotiate the AWS (13th-month bonus) and sign-on allowance to offset high central housing costs.',
      },
      sources: [
        { title: 'MyCareersFuture Singapore Market Salaries', url: 'https://www.mycareersfuture.gov.sg' },
        { title: 'Michael Page Singapore Salary Benchmark', url: 'https://www.michaelpage.com.sg' },
        { title: 'Levels.fyi Singapore Hub', url: 'https://www.levels.fyi/locations/sg/singapore' },
      ],
    };
  }

  if (c.includes('india') || c.includes('bengaluru') || c.includes('bangalore') || c.includes('hyderabad')) {
    const baseMedian = 2600000 * multiplier;
    return {
      salaryData: {
        currency: 'INR',
        currencySymbol: '₹',
        period: 'per year (CTC)',
        minSalary: Math.round(baseMedian * 0.78),
        medianSalary: Math.round(baseMedian),
        maxSalary: Math.round(baseMedian * 1.45),
        minFormatted: `₹${(Math.round(baseMedian * 0.78) / 100000).toFixed(1)} LPA`,
        medianFormatted: `₹${(Math.round(baseMedian) / 100000).toFixed(1)} LPA`,
        maxFormatted: `₹${(Math.round(baseMedian * 1.45) / 100000).toFixed(1)} LPA`,
        bonusAndEquity: '10%–20% variable component + joining bonus + US dollar pegged stock units (RSUs)',
        topPayingHubs: ['Bengaluru (Electronic City & ORR)', 'Hyderabad (HITEC City)', 'Pune', 'Gurugram / Noida (NCR)', 'Chennai'],
        highDemandSkills: ['Full Stack (React + Node/Go)', 'System Design at Scale', 'AWS / Kubernetes', 'Generative AI Pipelines'],
        marketOutlook: 'Global Capability Centers (GCCs) and product startups paying tier-1 competitive packages.',
        negotiationTip: 'Scrutinize the Fixed Base vs Variable CTC split. Aim for at least 80% fixed and negotiate a joining bonus.',
      },
      sources: [
        { title: 'AmbitionBox India Salary Explorer', url: 'https://www.ambitionbox.com/salaries' },
        { title: 'Levels.fyi India Compensation Hub', url: 'https://www.levels.fyi/locations/in/india' },
        { title: 'Naukri.com Salary Trends', url: 'https://www.naukri.com' },
      ],
    };
  }

  // Global / General Fallback
  const baseMedian = 95000 * multiplier;
  return {
    salaryData: {
      currency: 'USD',
      currencySymbol: '$',
      period: 'per year',
      minSalary: Math.round(baseMedian * 0.8),
      medianSalary: Math.round(baseMedian),
      maxSalary: Math.round(baseMedian * 1.3),
      minFormatted: `$${Math.round(baseMedian * 0.8 / 1000)}k / yr`,
      medianFormatted: `$${Math.round(baseMedian / 1000)}k / yr`,
      maxFormatted: `$${Math.round(baseMedian * 1.3 / 1000)}k / yr`,
      bonusAndEquity: 'Performance bonus (8-15%) + remote office stipend',
      topPayingHubs: ['Capital & Tech Hub Metros', 'Global Remote Opportunities'],
      highDemandSkills: ['Cloud Architecture', 'Full-Stack Modern Frameworks', 'System Reliability', 'Cross-Functional Leadership'],
      marketOutlook: 'Consistent global hiring for adaptable professionals who demonstrate measurable business ROI.',
      negotiationTip: 'Benchmark against regional cost of living and propose milestone-based compensation reviews after 6 months.',
    },
    sources: [
      { title: 'Glassdoor Global Salaries', url: 'https://www.glassdoor.com' },
      { title: 'Payscale Global Compensation Index', url: 'https://www.payscale.com' },
      { title: 'Levels.fyi Global Insights', url: 'https://www.levels.fyi' },
    ],
  };
}

import { ResumeFormData, MarketplaceItem } from '../types/resume';

export const initialResumeFormData: ResumeFormData = {
  contact: {
    fullName: '',
    headline: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    website: '',
    github: '',
  },
  summary: '',
  experiences: [
    {
      id: 'exp-1',
      role: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
      bulletPoints: [''],
    },
  ],
  education: [
    {
      id: 'edu-1',
      institution: '',
      degree: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: '',
      honors: '',
    },
  ],
  skills: {
    technical: '',
    soft: '',
    tools: '',
  },
  achievements: [],
  targetJob: {
    title: '',
    company: '',
    jobDescription: '',
    hiringManager: '',
  },
};

export const samplePreloadData: ResumeFormData = {
  contact: {
    fullName: 'Aarav Sharma',
    headline: 'Senior Full-Stack Software Engineer',
    email: 'aarav.sharma.dev@example.com',
    phone: '+91 98765 43210',
    location: 'Bengaluru, Karnataka, India',
    linkedin: 'linkedin.com/in/aarav-sharma-sample',
    website: 'aaravsharma.dev',
    github: 'github.com/aaravsharma',
  },
  summary:
    'Full-stack software engineer with 6+ years of experience architecting resilient web applications, REST/GraphQL APIs, and distributed microservices. Proven background reducing API latency, mentoring junior engineers, and modernizing legacy codebases with TypeScript, React, and Node.js.',
  experiences: [
    {
      id: 'exp-1',
      role: 'Senior Software Engineer',
      company: 'Zenith Logistics Cloud',
      location: 'Bengaluru, India',
      startDate: 'July 2022',
      endDate: 'Present',
      isCurrent: true,
      bulletPoints: [
        'Architected real-time package tracking dashboard in React & TypeScript serving 40,000+ daily drivers with 99.95% uptime.',
        'Migrated core inventory service from monolith to Node.js event-driven microservices, reducing p99 API response times from 480ms to 110ms.',
        'Mentored 4 junior engineers through weekly pairing and code review workshops, fostering high test coverage (>85%).',
      ],
    },
    {
      id: 'exp-2',
      role: 'Full-Stack Developer',
      company: 'Apex Digital Solutions',
      location: 'Pune, India',
      startDate: 'August 2019',
      endDate: 'June 2022',
      isCurrent: false,
      bulletPoints: [
        'Built dynamic checkout flows and webhook integrations with payment gateways for 12 multi-tenant enterprise clients.',
        'Optimized PostgreSQL database queries and connection pools, decreasing average page load duration by 35%.',
        'Coordinated cross-functional releases with QA and product designers across two-week Agile sprint cycles.',
      ],
    },
  ],
  education: [
    {
      id: 'edu-1',
      institution: 'National Institute of Technology Karnataka (NITK)',
      degree: 'Bachelor of Technology (B.Tech)',
      fieldOfStudy: 'Computer Science and Engineering',
      startDate: '2015',
      endDate: '2019',
      honors: 'First Class with Distinction',
    },
  ],
  skills: {
    technical: 'TypeScript, JavaScript (ES2022+), React, Node.js, Express, PostgreSQL, REST APIs, GraphQL, Docker, Redis',
    soft: 'Technical Leadership, Mentorship, Cross-Functional Communication, System Design, Incident Management',
    tools: 'Git, GitHub Actions, AWS (S3, ECS), Vite, Jest, Playwright, Postman, Linux',
  },
  achievements: [
    {
      id: 'ach-1',
      title: 'Engineering Excellence Award',
      organization: 'Zenith Logistics Cloud',
      year: '2024',
      description: 'Recognized for leading the zero-downtime database migration project on time.',
    },
    {
      id: 'ach-2',
      title: 'AWS Certified Solutions Architect – Associate',
      organization: 'Amazon Web Services',
      year: '2023',
      description: 'Credential validation ID: AWS-892419 (Active certification).',
    },
  ],
  targetJob: {
    title: 'Lead Software Engineer (Platform)',
    company: 'Book Kaaro Technologies',
    jobDescription:
      'We are looking for a Lead Software Engineer to head our core booking and platform infrastructure. Key responsibilities include scaling distributed microservices, designing developer-friendly APIs, mentoring engineers, and collaborating with product leaders on critical roadmap features.',
    hiringManager: 'Talent Acquisition Team',
  },
};

export const bookKaaroMarketplaceItems: MarketplaceItem[] = [
  {
    id: 'bk-tpl-tech',
    title: 'Book Kaaro Engineering & Tech Lead Resume Pack',
    category: 'Resume Templates',
    description:
      'Single-column typographic template structured for engineers, architects, and technical leads. Designed for high legibility, clean printing, and standard parsing.',
    badge: 'Preview Template',
    tags: ['Single-Column', 'Tech-Focused', 'Print-Optimized'],
    imagePath: '/src/assets/images/pack_tech_lead_1790748548270.jpg',
    isPlaceholder: true,
    priceNote: '[Placeholder Preview] Built-in with builder',
    features: [
      'Clean typography hierarchy (Plus Jakarta Sans & Monospace)',
      'High-contrast print stylesheet for ink-saving physical copies',
      'Fact-checked bullet layout emphasizing real metrics',
    ],
  },
  {
    id: 'bk-tpl-exec',
    title: 'Book Kaaro Executive & Director Dossier Pack',
    category: 'Executive Bundles',
    description:
      'Two-page executive format balancing strategic leadership narrative, board-level impact, and operational accomplishments.',
    badge: 'Curated Dossier',
    tags: ['Executive', 'Leadership', 'Strategic Summary'],
    imagePath: '/src/assets/images/pack_executive_suite_1790748564803.jpg',
    isPlaceholder: true,
    priceNote: '[Placeholder Preview] Coming Soon / In Preview',
    features: [
      'Comprehensive executive summary block',
      'Structured board governance and advisory section',
      'Matching cover letter letterhead layout',
    ],
  },
  {
    id: 'bk-tpl-star',
    title: 'Book Kaaro STAR Interview Playbook & Guide',
    category: 'Interview Packs',
    description:
      'Comprehensive preparation methodology guide with concrete frameworks to structure behavioural and technical interview answers honestly.',
    badge: 'Prep Resource',
    tags: ['STAR Method', 'Interview Guide', 'Behavioral'],
    imagePath: '/src/assets/images/bookkaaro_hero_desk_1790748530055.jpg',
    isPlaceholder: true,
    priceNote: '[Placeholder Preview] Free Educational Resource',
    features: [
      'Guidance on avoiding deceptive claims and staying grounded in facts',
      'Step-by-step Situation-Task-Action-Result drafting exercises',
      'Common pitfalls and pivot techniques for junior-to-staff engineers',
    ],
  },
];

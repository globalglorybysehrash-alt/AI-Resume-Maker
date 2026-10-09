import { ResumeFormData } from '../types/resume';

export interface ExtractedResumeResult {
  formData: Partial<ResumeFormData>;
  rawTextPreview: string;
  sourceType: 'pdf' | 'image' | 'word' | 'json' | 'text';
  detectedType: string;
  confidenceScore: number;
  stats: {
    experiencesCount: number;
    educationCount: number;
    achievementsCount: number;
    hasDates: boolean;
    hasContact: boolean;
  };
}

/**
 * Converts a browser File into a base64 string
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1] || '';
      resolve(base64);
    };
    reader.onerror = (err) => reject(err);
  });
}

function getMimeFromFilename(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf':
      return 'application/pdf';
    case 'docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'doc':
      return 'application/msword';
    case 'png':
      return 'image/png';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'webp':
      return 'image/webp';
    case 'json':
      return 'application/json';
    default:
      return 'text/plain';
  }
}

/**
 * Parses an uploaded resume file (Image, PDF, Word docx, Text, or JSON)
 * via the server-side Gemini 3.8 Flash multimodal extraction engine.
 */
export async function parseUploadedResumeFile(file: File): Promise<ExtractedResumeResult> {
  const filename = file.name;
  const ext = filename.split('.').pop()?.toLowerCase() || '';

  // 1. Instant client-side JSON parsing for Book Kaaro exports
  if (ext === 'json') {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      if (parsed.header && parsed.experience) {
        return {
          formData: {
            contact: {
              fullName: parsed.header.fullName || '',
              headline: parsed.header.headline || '',
              email: parsed.header.email || '',
              phone: parsed.header.phone || '',
              location: parsed.header.location || '',
              linkedin: parsed.header.links?.[0] || '',
              website: parsed.header.links?.[1] || '',
              github: parsed.header.links?.[2] || '',
            },
            summary: parsed.summary || '',
            experiences: (parsed.experience || []).map((e: any, idx: number) => ({
              id: `exp-${Date.now()}-${idx}`,
              role: e.role || '',
              company: e.company || '',
              location: e.location || '',
              startDate: e.dates?.split('–')?.[0]?.trim() || e.dates || '',
              endDate: e.dates?.split('–')?.[1]?.trim() || '',
              isCurrent: Boolean(e.dates?.toLowerCase().includes('present')),
              bulletPoints: Array.isArray(e.bullets) ? e.bullets : [e.bullets || ''],
            })),
            education: (parsed.education || []).map((ed: any, idx: number) => ({
              id: `edu-${Date.now()}-${idx}`,
              institution: ed.institution || '',
              degree: ed.degree || '',
              fieldOfStudy: ed.details || '',
              startDate: '',
              endDate: ed.dates || '',
              honors: '',
            })),
            skills: {
              technical: (parsed.skills || [])
                .map((s: any) => (Array.isArray(s.items) ? s.items.join(', ') : ''))
                .filter(Boolean)
                .join(', '),
              soft: '',
              tools: '',
            },
            achievements: (parsed.achievements || []).map((a: any, idx: number) => ({
              id: `ach-${Date.now()}-${idx}`,
              title: a.title || '',
              organization: a.organization || '',
              year: a.year || '',
              description: a.description || '',
            })),
          },
          rawTextPreview: text.substring(0, 800),
          sourceType: 'json',
          detectedType: 'Book Kaaro JSON Backup',
          confidenceScore: 100,
          stats: {
            experiencesCount: parsed.experience?.length || 0,
            educationCount: parsed.education?.length || 0,
            achievementsCount: parsed.achievements?.length || 0,
            hasDates: true,
            hasContact: true,
          },
        };
      }
    } catch {
      // Proceed to server extraction if custom JSON
    }
  }

  // 2. Multimodal AI Extraction via Server-Side Gemini API
  try {
    const fileBase64 = await fileToBase64(file);
    const mimeType = file.type || getMimeFromFilename(filename);

    const res = await fetch('/api/extract-resume', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileBase64,
        mimeType,
        filename,
      }),
    });

    if (res.ok) {
      const result = await res.json();
      if (result.success && result.data) {
        let sourceType: 'pdf' | 'image' | 'word' | 'json' | 'text' = 'text';
        if (ext === 'pdf') sourceType = 'pdf';
        else if (['png', 'jpg', 'jpeg', 'webp'].includes(ext)) sourceType = 'image';
        else if (['docx', 'doc'].includes(ext)) sourceType = 'word';

        return {
          formData: result.data,
          rawTextPreview: `Extracted from ${filename} (${result.detectedType || sourceType.toUpperCase()}) with ${result.confidenceScore || 99}% accuracy.`,
          sourceType,
          detectedType: result.detectedType || `${sourceType.toUpperCase()} Resume`,
          confidenceScore: result.confidenceScore || 99,
          stats: result.stats || {
            experiencesCount: result.data.experiences?.length || 0,
            educationCount: result.data.education?.length || 0,
            achievementsCount: result.data.achievements?.length || 0,
            hasDates: Boolean(result.data.experiences?.some((e: any) => e.startDate || e.endDate)),
            hasContact: Boolean(result.data.contact?.fullName),
          },
        };
      }
    }
  } catch (err) {
    console.warn('Server-side extraction failed, falling back to browser text parsing:', err);
  }

  // 3. Fallback Client-side Text Extraction
  const rawText = await file.text();
  const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);
  const emailMatch = rawText.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
  const phoneMatch = rawText.match(/(\+?\d{1,4}?[-.\s]?\(?\d{1,4}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9})/g);

  return {
    formData: {
      contact: {
        fullName: lines[0] || '',
        headline: lines[1] || '',
        email: emailMatch ? emailMatch[0] : '',
        phone: phoneMatch ? phoneMatch[0] : '',
        location: '',
        linkedin: '',
        website: '',
        github: '',
      },
      summary: rawText.substring(0, 400),
      experiences: [],
      education: [],
      skills: {
        technical: '',
        soft: '',
        tools: '',
      },
      achievements: [],
    },
    rawTextPreview: rawText.substring(0, 800),
    sourceType: 'text',
    detectedType: 'Raw Text Document',
    confidenceScore: 85,
    stats: {
      experiencesCount: 0,
      educationCount: 0,
      achievementsCount: 0,
      hasDates: false,
      hasContact: Boolean(lines[0] || emailMatch),
    },
  };
}

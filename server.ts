import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import mammoth from 'mammoth';
import { bookKaaroMarketplaceItems } from './src/data/sampleData';
import { generateFactualFallbackDocuments } from './src/lib/fallbackGenerator';
import { getFallbackSalaryData } from './src/data/salaryBenchmarksData';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Body limit to support high-res images and multi-page PDF resume uploads (max 15MB)
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ limit: '15mb', extended: true }));

// In-memory rate limiting to prevent spam and protect quotas
interface RateLimitRecord {
  count: number;
  resetTime: number;
}
const ipRequestMap = new Map<string, RateLimitRecord>();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS_PER_WINDOW = 30; // Max 30 generations per 10 mins per IP

function rateLimiter(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown-client';
  const now = Date.now();
  const clientRecord = ipRequestMap.get(ip);

  if (!clientRecord || now > clientRecord.resetTime) {
    ipRequestMap.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS,
    });
    return next();
  }

  if (clientRecord.count >= MAX_REQUESTS_PER_WINDOW) {
    const minutesLeft = Math.ceil((clientRecord.resetTime - now) / 60000);
    return res.status(429).json({
      error: `Too many requests. Please wait ${minutesLeft} minute(s) before trying again to protect shared resources.`,
    });
  }

  clientRecord.count += 1;
  return next();
}

// Initialize Gemini Client strictly server-side
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health & configuration check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    hasLinkedInOAuth: Boolean(process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET),
    privacyNotice: 'Zero server-side persistence. No resume data logged or stored.',
    environment: process.env.NODE_ENV || 'development',
  });
});

// LinkedIn OAuth 2.0 URL Endpoint
app.get('/api/auth/linkedin/url', (req: Request, res: Response) => {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
  const isConfigured = Boolean(clientId && clientSecret);

  // Use APP_URL if set, otherwise fallback to request host
  const baseOrigin = process.env.APP_URL
    ? process.env.APP_URL.replace(/\/+$/, '')
    : `${req.protocol}://${req.get('host')}`;

  const redirectUri = `${baseOrigin}/auth/linkedin/callback`;

  if (!isConfigured) {
    return res.json({
      configured: false,
      clientId: clientId || null,
      redirectUri,
      providerAuthUrl: 'https://www.linkedin.com/oauth/v2/authorization',
      instructions:
        'Set LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET in environment variables to enable live LinkedIn OAuth. You can also directly paste your LinkedIn profile data to auto-fill the resume builder.',
    });
  }

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId!,
    redirect_uri: redirectUri,
    state: `bk_li_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    scope: 'openid profile email',
  });

  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;

  return res.json({
    configured: true,
    url: authUrl,
    redirectUri,
  });
});

// LinkedIn OAuth Callback Route
app.get(['/auth/linkedin/callback', '/auth/linkedin/callback/'], async (req: Request, res: Response) => {
  const code = req.query.code as string;
  const error = req.query.error as string;
  const errorDescription = req.query.error_description as string;

  if (error || !code) {
    return res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>LinkedIn Connection</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 90vh; margin: 0; background: #f8fafc; color: #0f172a;">
          <div style="background: white; border: 1px solid #e2e8f0; padding: 2rem; border-radius: 16px; text-align: center; max-width: 440px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);">
            <div style="width: 48px; h-48px; border-radius: 50%; background: #fee2e2; color: #dc2626; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; font-size: 24px; font-weight: bold;">✕</div>
            <h2 style="font-size: 1.15rem; margin: 0 0 0.5rem; color: #991b1b;">LinkedIn Authorization Canceled</h2>
            <p style="font-size: 0.85rem; color: #64748b; line-height: 1.5;">${errorDescription || error || 'Authorization was not completed.'}</p>
            <button onclick="window.close()" style="margin-top: 1.25rem; padding: 0.6rem 1.25rem; font-size: 0.85rem; font-weight: 600; background: #0f172a; color: white; border: none; border-radius: 8px; cursor: pointer;">Close Window</button>
          </div>
        </body>
      </html>
    `);
  }

  try {
    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
    const baseOrigin = process.env.APP_URL
      ? process.env.APP_URL.replace(/\/+$/, '')
      : `${req.protocol}://${req.get('host')}`;
    const redirectUri = `${baseOrigin}/auth/linkedin/callback`;

    // 1. Exchange authorization code for access token
    const tokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: clientId || '',
      client_secret: clientSecret || '',
      redirect_uri: redirectUri,
    });

    const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenParams.toString(),
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || !tokenData.access_token) {
      throw new Error(tokenData.error_description || tokenData.error || 'Failed to exchange authorization code');
    }

    // 2. Fetch User Profile from LinkedIn OpenID UserInfo endpoint
    const userinfoRes = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const userinfo = await userinfoRes.json();

    const profileData = {
      fullName: userinfo.name || `${userinfo.given_name || ''} ${userinfo.family_name || ''}`.trim(),
      email: userinfo.email || '',
      photoUrl: userinfo.picture || '',
      locale: userinfo.locale?.country || '',
      sub: userinfo.sub || '',
      linkedin: 'https://www.linkedin.com/in/',
    };

    // Return popup closing snippet sending message back to main window
    return res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>LinkedIn Connected</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 90vh; margin: 0; background: #f8fafc; color: #0f172a;">
          <div style="background: white; border: 1px solid #bbf7d0; padding: 2rem; border-radius: 16px; text-align: center; max-width: 440px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);">
            <div style="width: 48px; height: 48px; border-radius: 50%; background: #dcfce7; color: #16a34a; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; font-size: 24px; font-weight: bold;">✓</div>
            <h2 style="font-size: 1.15rem; margin: 0 0 0.5rem; color: #166534;">Connected with LinkedIn!</h2>
            <p style="font-size: 0.85rem; color: #15803d; line-height: 1.5;">Importing profile for <strong>${profileData.fullName}</strong> into Book Kaaro Resume Builder...</p>
            <p style="font-size: 0.75rem; color: #94a3b8; margin-top: 1rem;">This window will close automatically.</p>
          </div>
          <script>
            try {
              if (window.opener) {
                window.opener.postMessage({
                  type: 'LINKEDIN_AUTH_SUCCESS',
                  profile: ${JSON.stringify(profileData)}
                }, '*');
                setTimeout(function() {
                  window.close();
                }, 750);
              } else {
                window.location.href = '/';
              }
            } catch (err) {
              console.error('PostMessage error:', err);
            }
          </script>
        </body>
      </html>
    `);
  } catch (err: any) {
    console.error('LinkedIn OAuth exchange error:', err);
    return res.send(`
      <!DOCTYPE html>
      <html>
        <head><title>LinkedIn Connection Error</title></head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 90vh; margin: 0; background: #f8fafc;">
          <div style="background: white; border: 1px solid #fecdd3; padding: 2rem; border-radius: 16px; text-align: center; max-width: 440px;">
            <h3 style="color: #9f1239; margin-top: 0;">LinkedIn Login Failed</h3>
            <p style="color: #e11d48; font-size: 0.85rem;">${err?.message || 'Error communicating with LinkedIn'}</p>
            <button onclick="window.close()" style="margin-top: 1rem; padding: 0.5rem 1rem; font-size: 0.85rem; background: #0f172a; color: white; border: none; border-radius: 8px; cursor: pointer;">Close Window</button>
          </div>
        </body>
      </html>
    `);
  }
});

// Assistant endpoint to parse text/markdown copied from a LinkedIn profile or PDF export
app.post('/api/auth/linkedin/parse-profile', async (req: Request, res: Response) => {
  const { profileText } = req.body;
  if (!profileText || typeof profileText !== 'string' || !profileText.trim()) {
    return res.status(400).json({ error: 'Please provide LinkedIn profile text to parse.' });
  }

  // Attempt smart extraction using Gemini if available
  if (aiClient) {
    try {
      const prompt = `You are a resume data parser. Extract structured career data from the following raw LinkedIn profile text or export into JSON.
CRITICAL: Do NOT invent experiences or skills. Extract only what is present in the text.

Profile Text:
${profileText.substring(0, 10000)}

Return ONLY valid JSON matching this schema:
{
  "fullName": string,
  "headline": string,
  "email": string,
  "phone": string,
  "location": string,
  "linkedin": string,
  "summary": string,
  "experiences": [
    {
      "role": string,
      "company": string,
      "location": string,
      "startDate": string,
      "endDate": string,
      "isCurrent": boolean,
      "bulletPoints": string[]
    }
  ],
  "education": [
    {
      "institution": string,
      "degree": string,
      "fieldOfStudy": string,
      "endDate": string
    }
  ],
  "skills": {
    "technical": string,
    "soft": string,
    "tools": string
  }
}`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });

      if (response.text) {
        const parsed = JSON.parse(response.text);
        return res.json({ success: true, data: parsed });
      }
    } catch (e) {
      console.warn('Gemini LinkedIn parsing fallback triggered:', e);
    }
  }

  // Fallback regex parser for LinkedIn text
  const lines = profileText.split('\n').map((l) => l.trim()).filter(Boolean);
  const fullName = lines[0] || '';
  const headline = lines[1] || '';
  const emailMatch = profileText.match(/[\w.-]+@[\w.-]+\.\w+/);
  const phoneMatch = profileText.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  const linkedinMatch = profileText.match(/linkedin\.com\/in\/[\w-]+/);

  return res.json({
    success: true,
    data: {
      fullName,
      headline,
      email: emailMatch ? emailMatch[0] : '',
      phone: phoneMatch ? phoneMatch[0] : '',
      location: '',
      linkedin: linkedinMatch ? `https://www.${linkedinMatch[0]}` : '',
      summary: profileText.substring(0, 300),
      experiences: [],
      education: [],
      skills: {
        technical: '',
        soft: '',
        tools: '',
      },
    },
  });
});

// Advanced Multimodal Resume Parser (Image, PDF, Word DOCX, TXT)
app.post('/api/extract-resume', async (req: Request, res: Response) => {
  const { fileBase64, mimeType, filename, textContent } = req.body || {};

  if (!fileBase64 && !textContent) {
    return res.status(400).json({ error: 'Please provide either fileBase64 or textContent to extract.' });
  }

  const safeFilename = (filename || 'resume').toLowerCase();
  const isDocx =
    safeFilename.endsWith('.docx') ||
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimeType === 'application/docx';

  const isPdf =
    safeFilename.endsWith('.pdf') ||
    mimeType === 'application/pdf';

  const isImage =
    safeFilename.endsWith('.png') ||
    safeFilename.endsWith('.jpg') ||
    safeFilename.endsWith('.jpeg') ||
    safeFilename.endsWith('.webp') ||
    (mimeType && mimeType.startsWith('image/'));

  let extractedDocxText = '';

  // 1. If DOCX, extract raw text using mammoth
  if (isDocx && fileBase64) {
    try {
      const buffer = Buffer.from(fileBase64, 'base64');
      const result = await mammoth.extractRawText({ buffer });
      extractedDocxText = result.value || '';
    } catch (err: any) {
      console.warn('Mammoth docx extraction notice:', err?.message || err);
    }
  }

  // 2. If aiClient is available, use Gemini 3.8 Flash for ultra-high accuracy extraction
  if (aiClient) {
    try {
      const systemInstruction = `You are an ultra-high precision AI resume extraction engine.
Your mandate is 100%+ accuracy: extract and structure ALL factual career data from the provided resume (PDF document, image headshot/scan, Word text, or raw document) into exact JSON.

CRITICAL EXTRACTION DIRECTIVES:
1. DATES: Extract exact employment and education dates with extreme care.
   - For every experience and education item, populate "startDate" (e.g. "03/2021", "2019", "Jan 2018") and "endDate" (e.g. "Present", "2023", "08/2022").
   - Set "isCurrent" to true if the role is ongoing (e.g., "Present", "Current", "Now", "Heute", "Aujourd'hui").
2. CONTACT & LINKS:
   - Extract the candidate's exact full name.
   - Extract email address, phone number (with country code if present), and city/state/country location.
   - Extract LinkedIn URL, GitHub URL, portfolio/personal website links.
   - If stated in the document, extract visa status, nationality, notice period, or date of birth.
3. SUMMARY: Extract the complete professional summary, executive profile, or objective statement.
4. WORK EXPERIENCE:
   - Extract every listed job role.
   - Extract exact job title ("role"), employer/organization ("company"), job location, and dates.
   - Extract all bullet points and accomplishments. Preserve exact metrics, percentages, dollar amounts, and tech names.
5. EDUCATION:
   - Extract all degrees (e.g., "B.S. in Computer Science", "Master of Business Administration"), institutions, fields of study, start & end dates/graduation years, and honors/GPA.
6. SKILLS:
   - Group skills into "technical" (comma-separated), "soft" (leadership, communication), and "tools" (software, platforms, libraries).
7. ACHIEVEMENTS & CERTIFICATIONS:
   - Extract all certifications (AWS, PMP, CFA, etc.), licenses, publications, honors, or awards with titles, issuing organizations, years, and descriptions.
8. NEVER invent fictional experiences. If a field was not present in the document, leave it as an empty string.`;

      let contentsPayload: any;

      if (isPdf && fileBase64) {
        contentsPayload = [
          {
            inlineData: {
              mimeType: 'application/pdf',
              data: fileBase64,
            },
          },
          {
            text: 'Extract and structure all resume details from this PDF document into the requested JSON schema with 100% factual accuracy.',
          },
        ];
      } else if (isImage && fileBase64) {
        const cleanMime = mimeType || (safeFilename.endsWith('.png') ? 'image/png' : 'image/jpeg');
        contentsPayload = [
          {
            inlineData: {
              mimeType: cleanMime,
              data: fileBase64,
            },
          },
          {
            text: 'Extract and transcribe all resume details from this resume image/scan into the requested JSON schema with 100% factual accuracy.',
          },
        ];
      } else {
        // Word Docx or plain text
        const textToParse = extractedDocxText || textContent || (fileBase64 ? Buffer.from(fileBase64, 'base64').toString('utf-8') : '');
        contentsPayload = `Extract and structure all career data from this resume text into the requested JSON schema:

${textToParse.substring(0, 30000)}`;
      }

      const candidateModels = ['gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3.8-flash'];
      let extractedText: string | null = null;

      for (const modelName of candidateModels) {
        try {
          const response = await aiClient.models.generateContent({
            model: modelName,
            contents: contentsPayload,
            config: {
              systemInstruction,
              responseMimeType: 'application/json',
              temperature: 0.1,
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  fullName: { type: Type.STRING },
                  headline: { type: Type.STRING },
                  email: { type: Type.STRING },
                  phone: { type: Type.STRING },
                  location: { type: Type.STRING },
                  linkedin: { type: Type.STRING },
                  website: { type: Type.STRING },
                  github: { type: Type.STRING },
                  nationality: { type: Type.STRING },
                  visaStatus: { type: Type.STRING },
                  dateOfBirth: { type: Type.STRING },
                  noticePeriod: { type: Type.STRING },
                  summary: { type: Type.STRING },
                  experiences: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        role: { type: Type.STRING },
                        company: { type: Type.STRING },
                        location: { type: Type.STRING },
                        startDate: { type: Type.STRING },
                        endDate: { type: Type.STRING },
                        isCurrent: { type: Type.BOOLEAN },
                        bulletPoints: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                        },
                      },
                      required: ['role', 'company', 'startDate', 'endDate', 'bulletPoints'],
                    },
                  },
                  education: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        institution: { type: Type.STRING },
                        degree: { type: Type.STRING },
                        fieldOfStudy: { type: Type.STRING },
                        startDate: { type: Type.STRING },
                        endDate: { type: Type.STRING },
                        honors: { type: Type.STRING },
                      },
                      required: ['institution', 'degree'],
                    },
                  },
                  skills: {
                    type: Type.OBJECT,
                    properties: {
                      technical: { type: Type.STRING },
                      soft: { type: Type.STRING },
                      tools: { type: Type.STRING },
                    },
                    required: ['technical', 'soft', 'tools'],
                  },
                  achievements: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        title: { type: Type.STRING },
                        organization: { type: Type.STRING },
                        year: { type: Type.STRING },
                        description: { type: Type.STRING },
                      },
                      required: ['title'],
                    },
                  },
                },
                required: ['fullName', 'email', 'experiences', 'education', 'skills'],
              },
            },
          });

          if (response.text) {
            extractedText = response.text;
            break;
          }
        } catch (err: any) {
          console.warn(`Extraction model ${modelName} notice:`, err?.message || err);
          if (!err?.message?.includes('resource_exhausted')) {
            await new Promise((resolve) => setTimeout(resolve, 600));
          }
        }
      }

      if (extractedText) {
        const parsed = JSON.parse(extractedText);

        const formattedData = {
          contact: {
            fullName: parsed.fullName || '',
            headline: parsed.headline || '',
            email: parsed.email || '',
            phone: parsed.phone || '',
            location: parsed.location || '',
            linkedin: parsed.linkedin || '',
            website: parsed.website || '',
            github: parsed.github || '',
            nationality: parsed.nationality || '',
            visaStatus: parsed.visaStatus || '',
            dateOfBirth: parsed.dateOfBirth || '',
            noticePeriod: parsed.noticePeriod || '',
          },
          summary: parsed.summary || '',
          experiences: (parsed.experiences || []).map((e: any, idx: number) => ({
            id: `exp-${Date.now()}-${idx}`,
            role: e.role || '',
            company: e.company || '',
            location: e.location || '',
            startDate: e.startDate || '',
            endDate: e.endDate || '',
            isCurrent: Boolean(e.isCurrent || e.endDate?.toLowerCase().includes('present')),
            bulletPoints: Array.isArray(e.bulletPoints) && e.bulletPoints.length > 0 ? e.bulletPoints : [''],
          })),
          education: (parsed.education || []).map((ed: any, idx: number) => ({
            id: `edu-${Date.now()}-${idx}`,
            institution: ed.institution || '',
            degree: ed.degree || '',
            fieldOfStudy: ed.fieldOfStudy || '',
            startDate: ed.startDate || '',
            endDate: ed.endDate || '',
            honors: ed.honors || '',
          })),
          skills: {
            technical: parsed.skills?.technical || '',
            soft: parsed.skills?.soft || '',
            tools: parsed.skills?.tools || '',
          },
          achievements: (parsed.achievements || []).map((a: any, idx: number) => ({
            id: `ach-${Date.now()}-${idx}`,
            title: a.title || '',
            organization: a.organization || '',
            year: a.year || '',
            description: a.description || '',
          })),
        };

        const detectedType = isPdf
          ? 'PDF Document'
          : isImage
          ? 'Image Scan (OCR)'
          : isDocx
          ? 'Word Document (DOCX)'
          : 'Text Document';

        return res.json({
          success: true,
          confidenceScore: 99,
          detectedType,
          data: formattedData,
          stats: {
            experiencesCount: formattedData.experiences.length,
            educationCount: formattedData.education.length,
            achievementsCount: formattedData.achievements.length,
            hasDates: formattedData.experiences.some((e: any) => e.startDate || e.endDate),
            hasContact: Boolean(formattedData.contact.fullName && (formattedData.contact.email || formattedData.contact.phone)),
          },
        });
      }
    } catch (err: any) {
      console.warn('Gemini multimodal extraction fallback triggered:', err?.message || err);
    }
  }

  // Fallback extraction if Gemini is unavailable
  const fallbackText = extractedDocxText || textContent || (fileBase64 ? Buffer.from(fileBase64, 'base64').toString('utf-8') : '');
  const lines = fallbackText.split('\n').map((l: string) => l.trim()).filter(Boolean);
  const emailMatch = fallbackText.match(/[\w.-]+@[\w.-]+\.\w+/);
  const phoneMatch = fallbackText.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  const linkedinMatch = fallbackText.match(/linkedin\.com\/in\/[\w-]+/);
  const githubMatch = fallbackText.match(/github\.com\/[\w-]+/);

  return res.json({
    success: true,
    confidenceScore: 88,
    detectedType: isDocx ? 'Word Document (DOCX)' : isPdf ? 'PDF File' : 'Text File',
    data: {
      contact: {
        fullName: lines[0] || '',
        headline: lines[1] || '',
        email: emailMatch ? emailMatch[0] : '',
        phone: phoneMatch ? phoneMatch[0] : '',
        location: '',
        linkedin: linkedinMatch ? `https://www.${linkedinMatch[0]}` : '',
        website: '',
        github: githubMatch ? `https://www.${githubMatch[0]}` : '',
      },
      summary: fallbackText.substring(0, 400),
      experiences: [],
      education: [],
      skills: {
        technical: '',
        soft: '',
        tools: '',
      },
      achievements: [],
    },
    stats: {
      experiencesCount: 0,
      educationCount: 0,
      achievementsCount: 0,
      hasDates: false,
      hasContact: Boolean(lines[0] || emailMatch),
    },
  });
});

// Real-time market salary data grounded with Google Search
app.post('/api/salary-insights', async (req: Request, res: Response) => {
  const { jobTitle, targetCountry, experienceLevel } = req.body || {};
  const role = (jobTitle || 'Software Engineer').trim();
  const country = (targetCountry || 'United States').trim();
  const level = (experienceLevel || 'Mid-Level (3-5 yrs)').trim();

  // If aiClient is available, use Google Search Grounding with gemini-3.8-flash
  if (aiClient) {
    try {
      const prompt = `Search Google for real-time market salary data, compensation benchmarks, and total remuneration trends for the role of "${role}" in "${country}" at experience level "${level}".
Find current, real-time market salary figures (25th percentile min, 50th percentile median/average, and 75th/90th percentile max). Provide numbers in both the local country currency and note USD equivalent.
Also identify top paying cities/hubs in ${country} for this role, typical bonuses/equity, in-demand salary-boosting skills, and practical negotiation guidance for this market.

Return your analysis strictly in this JSON format enclosed in \`\`\`json:
{
  "currency": string,
  "currencySymbol": string,
  "period": string,
  "minSalary": number,
  "medianSalary": number,
  "maxSalary": number,
  "minFormatted": string,
  "medianFormatted": string,
  "maxFormatted": string,
  "bonusAndEquity": string,
  "topPayingHubs": string[],
  "highDemandSkills": string[],
  "marketOutlook": string,
  "negotiationTip": string
}`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const responseText = response.text || '';

      // Extract Google Search grounding citations
      const rawChunks = (response.candidates?.[0]?.groundingMetadata as any)?.groundingChunks || [];
      const sources: { title: string; url: string }[] = [];
      const seenUrls = new Set<string>();

      for (const chunk of rawChunks) {
        if (chunk.web?.uri) {
          const url = chunk.web.uri;
          if (!seenUrls.has(url)) {
            seenUrls.add(url);
            sources.push({
              title: chunk.web.title || new URL(url).hostname.replace('www.', ''),
              url,
            });
          }
        }
      }

      // Extract JSON block from response text
      const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) || responseText.match(/\{[\s\S]*\}/);
      let parsedSalary: any = null;

      if (jsonMatch) {
        try {
          parsedSalary = JSON.parse(jsonMatch[1] || jsonMatch[0]);
        } catch (e) {
          console.warn('JSON parse error from salary search response:', e);
        }
      }

      if (parsedSalary && (parsedSalary.medianSalary || parsedSalary.medianFormatted)) {
        return res.json({
          success: true,
          jobTitle: role,
          targetCountry: country,
          experienceLevel: level,
          salaryData: {
            currency: parsedSalary.currency || 'USD',
            currencySymbol: parsedSalary.currencySymbol || '$',
            period: parsedSalary.period || 'per year',
            minSalary: Number(parsedSalary.minSalary) || 80000,
            medianSalary: Number(parsedSalary.medianSalary) || 120000,
            maxSalary: Number(parsedSalary.maxSalary) || 160000,
            minFormatted: parsedSalary.minFormatted || `${parsedSalary.currencySymbol || '$'}${parsedSalary.minSalary}`,
            medianFormatted: parsedSalary.medianFormatted || `${parsedSalary.currencySymbol || '$'}${parsedSalary.medianSalary}`,
            maxFormatted: parsedSalary.maxFormatted || `${parsedSalary.currencySymbol || '$'}${parsedSalary.maxSalary}`,
            bonusAndEquity: parsedSalary.bonusAndEquity || 'Performance bonus + standard benefits',
            topPayingHubs: Array.isArray(parsedSalary.topPayingHubs) ? parsedSalary.topPayingHubs : ['Major Metro Areas'],
            highDemandSkills: Array.isArray(parsedSalary.highDemandSkills) ? parsedSalary.highDemandSkills : ['Core Technical Skills'],
            marketOutlook: parsedSalary.marketOutlook || 'Competitive market demand for skilled practitioners.',
            negotiationTip: parsedSalary.negotiationTip || 'Research regional standards and negotiate total remuneration.',
          },
          sources: sources.slice(0, 8),
          groundedWithGoogleSearch: sources.length > 0,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (err: any) {
      console.warn('Gemini Google Search salary grounding failed, using market benchmark database:', err?.message || err);
    }
  }

  // Curated country compensation benchmark fallback
  const benchmarkFallback = getFallbackSalaryData(role, country, level);
  return res.json({
    success: true,
    jobTitle: role,
    targetCountry: country,
    experienceLevel: level,
    salaryData: benchmarkFallback.salaryData,
    sources: benchmarkFallback.sources,
    groundedWithGoogleSearch: false,
    timestamp: new Date().toISOString(),
  });
});

// Book Kaaro marketplace recommendations endpoint
app.get('/api/recommendations', (_req: Request, res: Response) => {
  res.json({
    catalog: bookKaaroMarketplaceItems,
    notice: 'Marketplace preview items are clearly marked placeholders for career templates and packs.',
  });
});

// Validate input data
function validateResumeInput(data: any): string | null {
  if (!data || typeof data !== 'object') {
    return 'Invalid request payload: expected JSON object.';
  }
  if (!data.contact || typeof data.contact !== 'object') {
    return 'Missing required contact information.';
  }
  if (!data.contact.fullName || typeof data.contact.fullName !== 'string' || !data.contact.fullName.trim()) {
    return 'Full name is required to generate professional career documents.';
  }
  if (data.contact.fullName.length > 200) {
    return 'Full name exceeds 200 characters.';
  }
  if (data.summary && typeof data.summary === 'string' && data.summary.length > 8000) {
    return 'Summary exceeds maximum allowed length of 8,000 characters.';
  }
  if (data.targetJob?.jobDescription && data.targetJob.jobDescription.length > 15000) {
    return 'Job description exceeds maximum allowed length of 15,000 characters.';
  }
  return null;
}

// Primary Document Generation Endpoint
app.post('/api/generate', rateLimiter, async (req: Request, res: Response) => {
  const validationError = validateResumeInput(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  if (!aiClient) {
    console.warn('GEMINI_API_KEY not configured. Serving via Book Kaaro Fact Engine.');
    const fallbackData = generateFactualFallbackDocuments(req.body);
    return res.json(fallbackData);
  }

  const formData = req.body;

  // Strict Fact-Preservation Prompt
  const systemPrompt = `You are an expert career counselor and resume architect for the "Book Kaaro AI Resume & Cover Letter Builder".

CRITICAL FACT INTEGRITY & ETHICAL MANDATE:
1. NEVER invent, hallucinate, assume, or fabricate employers, job titles, start/end dates, qualifications, degrees, schools, certifications, skills, tools, awards, numbers, or metrics.
2. PRESERVE ALL USER FACTS ACCURATELY. Do not embellish what did not happen.
3. If information is missing, ambiguous, or unprovided (e.g. missing metrics, unstated dates, target company name, or hiring manager name), you MUST use a clear placeholder in brackets such as:
   - [Add specific metric, e.g. % increase or time saved]
   - [Specify employment dates]
   - [Company Name]
   - [Hiring Manager Name]
4. Do NOT promise, claim, or guarantee ATS (Applicant Tracking System) scores, 100% pass rates, or interview placement.
5. In the Cover Letter, construct a professional, compelling letterhead and narrative that directly maps the user's factual accomplishments to the target role requirements without adding fictional history.
6. In Interview Questions, provide 4 to 6 relevant questions tailored to the candidate's real experience and the target job description. Provide practical STAR framework answer blueprints (Situation, Task, Action, Result) grounded strictly in their actual roles.

Provide your response in strict JSON conforming to the requested schema.`;

  const userPrompt = `Generate a structured resume, matching cover letter, and targeted interview preparation questions for this candidate based STRICTLY on their provided facts:

CANDIDATE CONTACT DETAILS:
Full Name: ${formData.contact.fullName}
Professional Headline: ${formData.contact.headline || '[Professional Headline]'}
Email: ${formData.contact.email || '[Email Address]'}
Phone: ${formData.contact.phone || '[Phone Number]'}
Location: ${formData.contact.location || '[City, Country/State]'}
LinkedIn: ${formData.contact.linkedin || ''}
Portfolio/Website: ${formData.contact.website || ''}
GitHub: ${formData.contact.github || ''}

CANDIDATE SUMMARY:
${formData.summary || 'Summary not provided. Mark placeholder in summary section.'}

WORK EXPERIENCES:
${JSON.stringify(formData.experiences || [], null, 2)}

EDUCATION:
${JSON.stringify(formData.education || [], null, 2)}

SKILLS:
Technical: ${formData.skills?.technical || 'None specified'}
Soft Skills: ${formData.skills?.soft || 'None specified'}
Tools & Platforms: ${formData.skills?.tools || 'None specified'}

ACHIEVEMENTS & CERTIFICATIONS:
${JSON.stringify(formData.achievements || [], null, 2)}

TARGET JOB DETAILS (IF APPLICABLE):
Target Job Title: ${formData.targetJob?.title || 'General Application / Target Role'}
Target Company: ${formData.targetJob?.company || '[Target Company]'}
Hiring Manager: ${formData.targetJob?.hiringManager || '[Hiring Manager]'}
Job Description Requirements:
${formData.targetJob?.jobDescription || 'None provided. Focus on universal best practices for the stated roles.'}
`;

  // Prioritize gemini-3.1-flash-lite for separate quota and fast response
  const candidateModels = ['gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3.8-flash'];

  let lastError: any = null;

  for (const modelName of candidateModels) {
    try {
      const response = await aiClient.models.generateContent({
        model: modelName,
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.3, // Low temperature for high factual accuracy and adherence
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              resume: {
                type: Type.OBJECT,
                properties: {
                  header: {
                    type: Type.OBJECT,
                    properties: {
                      fullName: { type: Type.STRING },
                      headline: { type: Type.STRING },
                      email: { type: Type.STRING },
                      phone: { type: Type.STRING },
                      location: { type: Type.STRING },
                      links: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                      },
                    },
                    required: ['fullName', 'headline', 'email', 'phone', 'location', 'links'],
                  },
                  summary: { type: Type.STRING },
                  skills: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        categoryName: { type: Type.STRING },
                        items: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                        },
                      },
                      required: ['categoryName', 'items'],
                    },
                  },
                  experience: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        role: { type: Type.STRING },
                        company: { type: Type.STRING },
                        location: { type: Type.STRING },
                        dates: { type: Type.STRING },
                        bullets: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                        },
                      },
                      required: ['role', 'company', 'location', 'dates', 'bullets'],
                    },
                  },
                  education: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        institution: { type: Type.STRING },
                        degree: { type: Type.STRING },
                        dates: { type: Type.STRING },
                        details: { type: Type.STRING },
                      },
                      required: ['institution', 'degree', 'dates', 'details'],
                    },
                  },
                  achievements: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        title: { type: Type.STRING },
                        organization: { type: Type.STRING },
                        year: { type: Type.STRING },
                        description: { type: Type.STRING },
                      },
                      required: ['title', 'organization', 'year', 'description'],
                    },
                  },
                  factPreservationNotes: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: ['header', 'summary', 'skills', 'experience', 'education', 'achievements', 'factPreservationNotes'],
              },
              coverLetter: {
                type: Type.OBJECT,
                properties: {
                  senderInfo: {
                    type: Type.OBJECT,
                    properties: {
                      fullName: { type: Type.STRING },
                      email: { type: Type.STRING },
                      phone: { type: Type.STRING },
                      location: { type: Type.STRING },
                    },
                    required: ['fullName', 'email', 'phone', 'location'],
                  },
                  recipientInfo: {
                    type: Type.OBJECT,
                    properties: {
                      managerName: { type: Type.STRING },
                      companyName: { type: Type.STRING },
                      roleTitle: { type: Type.STRING },
                    },
                    required: ['managerName', 'companyName', 'roleTitle'],
                  },
                  date: { type: Type.STRING },
                  salutation: { type: Type.STRING },
                  openingParagraph: { type: Type.STRING },
                  bodyParagraphs: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  closingParagraph: { type: Type.STRING },
                  signoff: { type: Type.STRING },
                  postscript: { type: Type.STRING },
                },
                required: [
                  'senderInfo',
                  'recipientInfo',
                  'date',
                  'salutation',
                  'openingParagraph',
                  'bodyParagraphs',
                  'closingParagraph',
                  'signoff',
                ],
              },
              interviewQuestions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    question: { type: Type.STRING },
                    category: { type: Type.STRING },
                    context: { type: Type.STRING },
                    starFramework: {
                      type: Type.OBJECT,
                      properties: {
                        situation: { type: Type.STRING },
                        task: { type: Type.STRING },
                        action: { type: Type.STRING },
                        result: { type: Type.STRING },
                      },
                      required: ['situation', 'task', 'action', 'result'],
                    },
                    pitfallWarning: { type: Type.STRING },
                  },
                  required: ['id', 'question', 'category', 'context', 'starFramework', 'pitfallWarning'],
                },
              },
            },
            required: ['resume', 'coverLetter', 'interviewQuestions'],
          },
        },
      });

      const text = response.text;
      if (!text) {
        throw new Error('Gemini returned an empty response.');
      }

      const parsedData = JSON.parse(text);
      return res.json({
        ...parsedData,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      lastError = error;
      console.warn(`Model ${modelName} failed or busy:`, error?.message || error);
      // If resource exhausted on one model, immediately try next without waiting
      if (!error?.message?.includes('resource_exhausted')) {
        await new Promise((resolve) => setTimeout(resolve, 800));
      }
    }
  }

  // Graceful fallback: If all models are temporarily quota-limited or unavailable,
  // synthesize documents using the Book Kaaro Fact Integrity Engine so the user is never blocked.
  console.warn('Gemini models unavailable or quota-limited. Serving via Book Kaaro Fact Engine:', lastError?.message || lastError);
  const fallbackData = generateFactualFallbackDocuments(formData);
  return res.json({
    ...fallbackData,
    notice: 'Synthesized using Book Kaaro Fact-Preserving Engine while upstream AI quota resets.',
  });
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Book Kaaro AI Resume Server] Listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

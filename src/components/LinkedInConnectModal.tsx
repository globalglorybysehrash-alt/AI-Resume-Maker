import React, { useState, useEffect } from 'react';
import { ResumeFormData } from '../types/resume';
import {
  X,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  FileText,
  Loader2,
  Info,
} from 'lucide-react';

interface LinkedInConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyProfileData: (data: Partial<ResumeFormData>) => void;
}

export const LinkedInConnectModal: React.FC<LinkedInConnectModalProps> = ({
  isOpen,
  onClose,
  onApplyProfileData,
}) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isConfigured, setIsConfigured] = useState<boolean>(true);
  const [redirectUri, setRedirectUri] = useState<string>('');
  const [copiedUri, setCopiedUri] = useState(false);

  // Manual Profile Text Pull (for importing complete job history, bullets, & skills)
  const [profileText, setProfileText] = useState('');
  const [isParsingText, setIsParsingText] = useState(false);
  const [parsedPreview, setParsedPreview] = useState<Partial<ResumeFormData> | null>(null);

  // Fetch status on modal open
  useEffect(() => {
    if (!isOpen) return;

    fetch('/api/auth/linkedin/url')
      .then((r) => r.json())
      .then((data) => {
        setIsConfigured(data.configured);
        setRedirectUri(data.redirectUri || `${window.location.origin}/auth/linkedin/callback`);
      })
      .catch((e) => {
        console.warn('Failed to check LinkedIn status:', e);
      });
  }, [isOpen]);

  // Listen for OAuth postMessage from popup
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Validate origin is from AI Studio preview or localhost
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost') && !origin.includes('127.0.0.1')) {
        return;
      }

      if (event.data?.type === 'LINKEDIN_AUTH_SUCCESS') {
        const profile = event.data.profile;
        if (profile) {
          const applied: Partial<ResumeFormData> = {
            contact: {
              fullName: profile.fullName || '',
              headline: profile.headline || '',
              email: profile.email || '',
              phone: '',
              location: profile.locale || '',
              linkedin: profile.linkedin || '',
              website: '',
              github: '',
              photoUrl: profile.photoUrl || '',
            },
          };

          onApplyProfileData(applied);
          setSuccessMsg(`Successfully connected! Imported profile for ${profile.fullName}.`);
          setIsConnecting(false);
          setTimeout(() => {
            onClose();
          }, 1800);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onApplyProfileData, onClose]);

  if (!isOpen) return null;

  // Trigger popup OAuth flow
  const handleConnectOAuth = async () => {
    setIsConnecting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/auth/linkedin/url');
      const data = await res.json();

      if (!data.configured || !data.url) {
        setIsConfigured(false);
        setErrorMsg('LinkedIn Client ID & Secret are not yet configured in environment variables.');
        setIsConnecting(false);
        return;
      }

      // Open OAuth provider authorization URL directly in popup
      const popup = window.open(
        data.url,
        'linkedin_oauth_popup',
        'width=600,height=700,status=no,toolbar=no,menubar=no'
      );

      if (!popup || popup.closed || typeof popup.closed === 'undefined') {
        setErrorMsg('Popup was blocked by your browser. Please allow popups for this site and try again.');
        setIsConnecting(false);
      }
    } catch (e: any) {
      console.error('LinkedIn connect error:', e);
      setErrorMsg(e?.message || 'Failed to initiate LinkedIn OAuth.');
      setIsConnecting(false);
    }
  };

  // Handle parsing pasted profile text / about / experience
  const handleParseProfileText = async () => {
    if (!profileText.trim()) {
      setErrorMsg('Please paste your LinkedIn profile text or export details.');
      return;
    }

    setIsParsingText(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/auth/linkedin/parse-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileText }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to parse LinkedIn text');
      }

      const p = data.data;
      const formatted: Partial<ResumeFormData> = {
        contact: {
          fullName: p.fullName || '',
          headline: p.headline || '',
          email: p.email || '',
          phone: p.phone || '',
          location: p.location || '',
          linkedin: p.linkedin || '',
          website: '',
          github: '',
        },
        summary: p.summary || '',
        experiences: (p.experiences || []).map((exp: any, i: number) => ({
          id: `li-exp-${Date.now()}-${i}`,
          role: exp.role || 'Professional Role',
          company: exp.company || 'Company',
          location: exp.location || '',
          startDate: exp.startDate || '',
          endDate: exp.endDate || '',
          isCurrent: Boolean(exp.isCurrent),
          bulletPoints: Array.isArray(exp.bulletPoints) && exp.bulletPoints.length > 0 ? exp.bulletPoints : [''],
        })),
        education: (p.education || []).map((edu: any, i: number) => ({
          id: `li-edu-${Date.now()}-${i}`,
          institution: edu.institution || '',
          degree: edu.degree || '',
          fieldOfStudy: edu.fieldOfStudy || '',
          startDate: '',
          endDate: edu.endDate || '',
          honors: '',
        })),
        skills: {
          technical: p.skills?.technical || '',
          soft: p.skills?.soft || '',
          tools: p.skills?.tools || '',
        },
      };

      setParsedPreview(formatted);
    } catch (e: any) {
      console.error('LinkedIn parse error:', e);
      setErrorMsg(e?.message || 'Failed to parse LinkedIn text.');
    } finally {
      setIsParsingText(false);
    }
  };

  const handleApplyPreview = () => {
    if (parsedPreview) {
      onApplyProfileData(parsedPreview);
      setSuccessMsg('LinkedIn profile data successfully applied to your resume builder!');
      setTimeout(() => {
        onClose();
      }, 1200);
    }
  };

  const copyCallbackUrl = () => {
    navigator.clipboard.writeText(redirectUri);
    setCopiedUri(true);
    setTimeout(() => setCopiedUri(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#0077B5] to-[#0A66C2] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shadow-xs">
              <span className="font-extrabold text-[#0077B5] text-xl">in</span>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold tracking-tight">
                Connect with LinkedIn
              </h3>
              <p className="text-xs text-blue-100">
                Auto-pull your verified professional profile into Book Kaaro
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-blue-100 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-6">
          {/* Status Alerts */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50 flex items-start gap-2.5 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Connection Alert</p>
                <p className="mt-0.5">{errorMsg}</p>
              </div>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50 flex items-start gap-2.5 text-xs text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Success</p>
                <p className="mt-0.5">{successMsg}</p>
              </div>
            </div>
          )}

          {/* Option 1: Direct OAuth 2.0 Sign-In */}
          <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Option 1: Direct LinkedIn OAuth Login
              </span>
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                OpenID Connect
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Authenticate directly with LinkedIn in a secure popup to automatically pull your verified name, email address, profile picture, and profile URL.
            </p>

            <div className="pt-1 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleConnectOAuth}
                disabled={isConnecting}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-[#0A66C2] hover:bg-[#004182] transition-colors shadow-xs disabled:opacity-50"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Connecting to LinkedIn...</span>
                  </>
                ) : (
                  <>
                    <div className="w-4 h-4 rounded bg-white text-[#0A66C2] flex items-center justify-center font-bold text-[11px]">
                      in
                    </div>
                    <span>Sign in with LinkedIn</span>
                  </>
                )}
              </button>
            </div>

            {/* Developer Setup Instructions if keys are pending */}
            {!isConfigured && (
              <div className="mt-3 p-3 rounded-lg border border-amber-200 bg-amber-50/70 text-xs text-amber-900 space-y-2">
                <div className="flex items-center gap-1.5 font-bold">
                  <Info className="w-3.5 h-3.5 text-amber-700" />
                  <span>LinkedIn Developer Setup Notice</span>
                </div>
                <p className="text-[11px] leading-relaxed text-amber-800">
                  To enable live 1-click LinkedIn OAuth, register an app at{' '}
                  <a
                    href="https://www.linkedin.com/developers/apps"
                    target="_blank"
                    rel="noreferrer"
                    className="underline font-semibold"
                  >
                    LinkedIn Developer Portal
                  </a>{' '}
                  and add this Redirect URI:
                </p>
                <div className="flex items-center gap-2 bg-white/90 p-2 rounded border border-amber-300">
                  <code className="text-[11px] font-mono text-slate-900 break-all flex-1">
                    {redirectUri}
                  </code>
                  <button
                    type="button"
                    onClick={copyCallbackUrl}
                    className="px-2 py-1 bg-slate-900 text-white rounded text-[10px] font-medium shrink-0 flex items-center gap-1"
                  >
                    {copiedUri ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedUri ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-[10px] text-amber-700">
                  Then configure <code className="font-mono font-bold">LINKEDIN_CLIENT_ID</code> and <code className="font-mono font-bold">LINKEDIN_CLIENT_SECRET</code> in your environment variables.
                </p>
              </div>
            )}
          </div>

          {/* Option 2: Full Profile Extractor (Work History, Experience & Skills) */}
          <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-white space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Option 2: Complete Profile Extraction (Experience &amp; Skills)
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                1-Click Full Import
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              LinkedIn's standard public API restricts member work history. To instantly import your <strong>complete past jobs, bullet points, skills, and summary</strong>, simply copy &amp; paste the text from your LinkedIn profile or LinkedIn PDF export:
            </p>

            <textarea
              rows={4}
              value={profileText}
              onChange={(e) => setProfileText(e.target.value)}
              placeholder="Paste your LinkedIn 'About', 'Experience', and 'Skills' text here... (or text from LinkedIn's 'Save to PDF' feature)"
              className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0A66C2] font-mono leading-relaxed"
            />

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handleParseProfileText}
                disabled={isParsingText || !profileText.trim()}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-40"
              >
                {isParsingText ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Extracting Career Data...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Parse LinkedIn Career Data</span>
                  </>
                )}
              </button>

              <span className="text-[11px] text-slate-500">
                Preserves factual accuracy
              </span>
            </div>

            {/* Parsed Preview Card */}
            {parsedPreview && (
              <div className="mt-4 p-4 rounded-xl border border-indigo-200 bg-indigo-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Extracted Profile Details
                  </span>
                  <button
                    type="button"
                    onClick={handleApplyPreview}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
                  >
                    <span>Apply to Resume Form</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-xs text-slate-700 space-y-1 bg-white p-3 rounded-lg border border-indigo-100">
                  <p>
                    <span className="font-semibold text-slate-900">Name:</span>{' '}
                    {parsedPreview.contact?.fullName || '(Not detected)'}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-900">Headline:</span>{' '}
                    {parsedPreview.contact?.headline || '(Not detected)'}
                  </p>
                  {parsedPreview.contact?.email && (
                    <p>
                      <span className="font-semibold text-slate-900">Email:</span>{' '}
                      {parsedPreview.contact?.email}
                    </p>
                  )}
                  <p>
                    <span className="font-semibold text-slate-900">Extracted Experiences:</span>{' '}
                    {parsedPreview.experiences?.length || 0} position(s)
                  </p>
                  <p>
                    <span className="font-semibold text-slate-900">Summary:</span>{' '}
                    {parsedPreview.summary ? `${parsedPreview.summary.substring(0, 100)}...` : '(None)'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Privacy First: OAuth tokens and profile data stay strictly in your browser.</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

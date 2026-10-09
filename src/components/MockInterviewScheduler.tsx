import React, { useState, useEffect } from 'react';
import { InterviewQuestionItem } from '../types/resume';
import {
  Calendar as CalendarIcon,
  Clock,
  Download,
  CalendarPlus,
  Check,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Trash2,
  Sparkles,
  Users,
  Video,
  FileText,
  AlertCircle,
  Bell,
  CheckCircle2,
} from 'lucide-react';
import {
  downloadIcsFile,
  buildGoogleCalendarUrl,
  buildOutlookWebUrl,
  CalendarEventConfig,
} from '../lib/calendarExport';

export interface ScheduledMockSession {
  id: string;
  title: string;
  dateTimeIso: string;
  durationMinutes: number;
  partnerType: string;
  selectedQuestionIds: string[];
  notes: string;
  completed?: boolean;
}

interface MockInterviewSchedulerProps {
  questions: InterviewQuestionItem[];
  jobTitle?: string;
  companyName?: string;
}

const STORAGE_KEY = 'bk_mock_interviews_v1';

export const MockInterviewScheduler: React.FC<MockInterviewSchedulerProps> = ({
  questions,
  jobTitle = 'Target Role',
  companyName = 'Target Company',
}) => {
  // Calendar date selection state (defaults to tomorrow)
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(10, 0, 0, 0);
    return d;
  });

  const [currentMonthView, setCurrentMonthView] = useState<Date>(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });

  // Time & Duration
  const [selectedTimeStr, setSelectedTimeStr] = useState<string>('10:00');
  const [durationMinutes, setDurationMinutes] = useState<number>(45);

  // Session Details
  const [partnerType, setPartnerType] = useState<string>('Self-Practice (Webcam & STAR Drill)');
  const [customNotes, setCustomNotes] = useState<string>('');
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>(() =>
    questions.slice(0, 3).map((q) => q.id)
  );

  // Scheduled Sessions Storage
  const [scheduledSessions, setScheduledSessions] = useState<ScheduledMockSession[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load mock interviews from localStorage', e);
    }
    return [];
  });

  const [downloadSuccessId, setDownloadSuccessId] = useState<string | null>(null);

  // Sync scheduled sessions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(scheduledSessions));
    } catch (e) {
      console.warn('Failed to save mock interviews to localStorage', e);
    }
  }, [scheduledSessions]);

  // Calendar calculation helpers
  const year = currentMonthView.getFullYear();
  const month = currentMonthView.getMonth(); // 0-indexed

  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 is Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    setCurrentMonthView(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonthView(new Date(year, month + 1, 1));
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handleSelectDateDay = (dayNum: number) => {
    const next = new Date(selectedDate);
    next.setFullYear(year, month, dayNum);
    setSelectedDate(next);
  };

  // Quick Preset Handlers
  const handleQuickPreset = (daysOffset: number, defaultHour = 10) => {
    const target = new Date();
    target.setDate(target.getDate() + daysOffset);
    target.setHours(defaultHour, 0, 0, 0);
    setSelectedDate(target);
    setCurrentMonthView(new Date(target.getFullYear(), target.getMonth(), 1));
    setSelectedTimeStr(`${defaultHour < 10 ? '0' : ''}${defaultHour}:00`);
  };

  const toggleQuestionSelection = (id: string) => {
    setSelectedQuestionIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAllQuestions = () => {
    if (selectedQuestionIds.length === questions.length) {
      setSelectedQuestionIds([]);
    } else {
      setSelectedQuestionIds(questions.map((q) => q.id));
    }
  };

  // Compile Calendar Event Config
  const buildCurrentEventConfig = (): CalendarEventConfig => {
    const [hours, mins] = selectedTimeStr.split(':').map(Number);
    const startDateTime = new Date(selectedDate);
    startDateTime.setHours(hours || 10, mins || 0, 0, 0);

    const title = `Mock Interview: ${jobTitle} (${companyName})`;

    // Prepare description with questions and STAR pointers
    const chosenQuestions = questions.filter((q) => selectedQuestionIds.includes(q.id));
    const questionLines = chosenQuestions
      .map(
        (q, idx) =>
          `\n${idx + 1}. [${q.category.toUpperCase()}] ${q.question}\n   • Situation: ${q.starFramework.situation}\n   • Action: ${q.starFramework.action}\n   • Result: ${q.starFramework.result}\n   • Warning: ${q.pitfallWarning}`
      )
      .join('\n');

    const description = [
      `🎯 Book Kaaro Mock Interview Session`,
      `Role: ${jobTitle}`,
      `Company / Domain: ${companyName}`,
      `Format: ${partnerType}`,
      `Duration: ${durationMinutes} Minutes`,
      customNotes ? `\nNotes: ${customNotes}` : '',
      `\n---------------------------------------`,
      `PRACTICE QUESTIONS & STAR BLUEPRINTS:`,
      questionLines || 'Review role-tailored STAR questions.',
      `\n---------------------------------------`,
      `Reminder: Focus on honest metrics, concise XYZ structure (Accomplished X by doing Y as measured by Z), and calm pacing.`,
    ].filter(Boolean).join('\n');

    return {
      title,
      description,
      location: 'Virtual Call / Private Practice Room',
      startDate: startDateTime,
      durationMinutes,
    };
  };

  // Action: Download .ics file
  const handleDownloadIcs = () => {
    const config = buildCurrentEventConfig();
    const sanitizedTitle = `Mock_Interview_${jobTitle.replace(/[^a-zA-Z0-9]/g, '_')}`;
    downloadIcsFile(config, `${sanitizedTitle}.ics`);

    // Auto-save to scheduled sessions list
    const newSession: ScheduledMockSession = {
      id: `session-${Date.now()}`,
      title: config.title,
      dateTimeIso: config.startDate.toISOString(),
      durationMinutes,
      partnerType,
      selectedQuestionIds,
      notes: customNotes,
      completed: false,
    };

    setScheduledSessions((prev) => [newSession, ...prev]);
    setDownloadSuccessId('current');
    setTimeout(() => setDownloadSuccessId(null), 3000);
  };

  const handleDownloadSavedIcs = (session: ScheduledMockSession) => {
    const start = new Date(session.dateTimeIso);
    const chosenQuestions = questions.filter((q) => session.selectedQuestionIds.includes(q.id));
    const questionLines = chosenQuestions
      .map((q, idx) => `${idx + 1}. ${q.question}\n   • Result: ${q.starFramework.result}`)
      .join('\n\n');

    const config: CalendarEventConfig = {
      title: session.title,
      description: `Book Kaaro Mock Interview Session\nFormat: ${session.partnerType}\n\nQuestions:\n${questionLines}`,
      startDate: start,
      durationMinutes: session.durationMinutes,
    };

    downloadIcsFile(config, `Mock_Interview_${start.toISOString().split('T')[0]}.ics`);
    setDownloadSuccessId(session.id);
    setTimeout(() => setDownloadSuccessId(null), 3000);
  };

  const handleDeleteSession = (id: string) => {
    setScheduledSessions((prev) => prev.filter((s) => s.id !== id));
  };

  const handleToggleComplete = (id: string) => {
    setScheduledSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s))
    );
  };

  // Google Calendar Link
  const currentGoogleUrl = buildGoogleCalendarUrl(buildCurrentEventConfig());
  const currentOutlookUrl = buildOutlookWebUrl(buildCurrentEventConfig());

  // Check if a day is today or selected
  const today = new Date();
  const isToday = (dayNum: number) =>
    today.getDate() === dayNum &&
    today.getMonth() === month &&
    today.getFullYear() === year;

  const isSelected = (dayNum: number) =>
    selectedDate.getDate() === dayNum &&
    selectedDate.getMonth() === month &&
    selectedDate.getFullYear() === year;

  const isPast = (dayNum: number) => {
    const checkDate = new Date(year, month, dayNum, 23, 59, 59);
    return checkDate.getTime() < today.setHours(0, 0, 0, 0);
  };

  return (
    <div className="no-print bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden mb-8">
      {/* Header Banner */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-1">
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Interactive Interview Scheduler</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold tracking-tight">
            Schedule a Mock Interview &amp; Export to Calendar
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mt-1 leading-relaxed">
            Pick a dedicated practice time, choose questions to drill, and download a ready-to-import <code className="text-amber-300 font-mono">.ics</code> file for your Apple Calendar, Google Calendar, or Outlook.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleDownloadIcs}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 transition-colors shadow-xs"
          >
            {downloadSuccessId === 'current' ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-800" />
                <span>Downloaded .ics!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download .ics Calendar File</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Month Calendar & Presets */}
        <div className="lg:col-span-6 space-y-5">
          {/* Quick Date Presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Quick Scheduling Presets
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleQuickPreset(1, 10)}
                className="px-2.5 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors"
              >
                Tomorrow @ 10:00 AM
              </button>
              <button
                type="button"
                onClick={() => handleQuickPreset(2, 14)}
                className="px-2.5 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors"
              >
                In 2 Days @ 2:00 PM
              </button>
              <button
                type="button"
                onClick={() => handleQuickPreset(3, 11)}
                className="px-2.5 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors"
              >
                This Weekend @ 11:00 AM
              </button>
              <button
                type="button"
                onClick={() => handleQuickPreset(7, 16)}
                className="px-2.5 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors"
              >
                Next Week
              </button>
            </div>
          </div>

          {/* Interactive Month Grid */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
            {/* Month & Nav */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-slate-900">
                {monthNames[month]} {year}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={prevMonth}
                  className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-md border border-slate-200 transition-colors"
                  title="Previous month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={nextMonth}
                  className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-md border border-slate-200 transition-colors"
                  title="Next month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-slate-400 mb-2">
              <span>Su</span>
              <span>Mo</span>
              <span>Tu</span>
              <span>We</span>
              <span>Th</span>
              <span>Fr</span>
              <span>Sa</span>
            </div>

            {/* Day grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Empty offset days */}
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} className="h-9" />
              ))}

              {/* Month days */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const past = isPast(dayNum);
                const selected = isSelected(dayNum);
                const current = isToday(dayNum);

                return (
                  <button
                    key={dayNum}
                    type="button"
                    disabled={past}
                    onClick={() => handleSelectDateDay(dayNum)}
                    className={`h-9 w-full rounded-lg text-xs font-semibold flex items-center justify-center transition-all ${
                      selected
                        ? 'bg-slate-900 text-white shadow-xs font-bold'
                        : past
                        ? 'text-slate-300 cursor-not-allowed'
                        : current
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'hover:bg-white hover:border hover:border-slate-200 text-slate-700'
                    }`}
                  >
                    {dayNum}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time & Duration Pickers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                Session Start Time
              </label>
              <input
                type="time"
                value={selectedTimeStr}
                onChange={(e) => setSelectedTimeStr(e.target.value)}
                className="w-full px-3 py-2 text-xs font-medium rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                Duration
              </label>
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs font-medium rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                <option value={30}>30 Minutes (Quick Drill)</option>
                <option value={45}>45 Minutes (Standard STAR Round)</option>
                <option value={60}>60 Minutes (Full In-Depth Session)</option>
                <option value={90}>90 Minutes (Executive / Multi-Round)</option>
              </select>
            </div>
          </div>

          {/* Partner & Format */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-slate-500" />
              Interview Practice Format
            </label>
            <select
              value={partnerType}
              onChange={(e) => setPartnerType(e.target.value)}
              className="w-full px-3 py-2 text-xs font-medium rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="Self-Practice (Webcam & STAR Drill)">
                Self-Practice (Record on Webcam / Voice & Critique)
              </option>
              <option value="Peer Practice (Friend / Study Partner)">
                Peer Mock (Practice with a study partner or colleague)
              </option>
              <option value="Mentor / Coach Feedback Session">
                Mentor / Coach Session (Expert review)
              </option>
              <option value="Real Hiring Manager / Recruiter Screen">
                Upcoming Real Recruiter Screen / Interview
              </option>
            </select>
          </div>
        </div>

        {/* Right Column: Question Selection & Live Summary */}
        <div className="lg:col-span-6 space-y-5">
          {/* Question Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                Select Questions to Embed in Calendar Invite ({selectedQuestionIds.length}/{questions.length})
              </label>
              <button
                type="button"
                onClick={selectAllQuestions}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
              >
                {selectedQuestionIds.length === questions.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl p-2.5 space-y-1.5 bg-slate-50/50">
              {questions.length === 0 ? (
                <p className="text-xs text-slate-500 p-2 text-center">No questions generated yet.</p>
              ) : (
                questions.map((q, i) => {
                  const isChecked = selectedQuestionIds.includes(q.id);
                  return (
                    <label
                      key={q.id || i}
                      className={`flex items-start gap-2.5 p-2 rounded-lg text-xs cursor-pointer transition-colors ${
                        isChecked ? 'bg-indigo-50/70 border border-indigo-200' : 'hover:bg-white'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleQuestionSelection(q.id)}
                        className="mt-0.5 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                      />
                      <div className="flex-1">
                        <span className="font-semibold text-slate-900 line-clamp-1">
                          {i + 1}. {q.question}
                        </span>
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                          {q.category} · Focus: {q.starFramework.result.substring(0, 50)}...
                        </span>
                      </div>
                    </label>
                  );
                })
              )}
            </div>
          </div>

          {/* Personal Focus Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Personal Goals / Focus Areas for this Session (Optional)
            </label>
            <input
              type="text"
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder="e.g. Focus on quantifying cost savings, slow down answering pace..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          {/* Event Preview Summary Card */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-amber-600" />
                Calendar Event Summary
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                15-Min Prior Alert Included
              </span>
            </div>

            <div className="text-xs text-slate-700 space-y-1">
              <p>
                <span className="font-semibold text-slate-900">Date:</span>{' '}
                {selectedDate.toLocaleDateString(undefined, {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
              <p>
                <span className="font-semibold text-slate-900">Time:</span>{' '}
                {selectedTimeStr} ({durationMinutes} mins)
              </p>
              <p>
                <span className="font-semibold text-slate-900">Format:</span> {partnerType}
              </p>
              <p>
                <span className="font-semibold text-slate-900">Embedded Questions:</span>{' '}
                {selectedQuestionIds.length} question blueprints with STAR hints
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadIcs}
                className="flex-1 inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
              >
                {downloadSuccessId === 'current' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Downloaded .ics File!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Download .ics File</span>
                  </>
                )}
              </button>

              <a
                href={currentGoogleUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                title="Add directly to Google Calendar via web"
              >
                <span>Google Cal</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>

              <a
                href={currentOutlookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                title="Add directly to Outlook via web"
              >
                <span>Outlook</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Scheduled Sessions History List */}
      {scheduledSessions.length > 0 && (
        <div className="p-5 sm:p-6 border-t border-slate-100 bg-slate-50/40">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <CalendarPlus className="w-3.5 h-3.5 text-slate-600" />
              Your Scheduled Practice Sessions ({scheduledSessions.length})
            </h4>
            <span className="text-[11px] text-slate-500">Saved to browser local memory</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {scheduledSessions.map((session) => {
              const sessionDate = new Date(session.dateTimeIso);
              const isPastSession = sessionDate.getTime() < Date.now();

              return (
                <div
                  key={session.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    session.completed
                      ? 'bg-emerald-50/40 border-emerald-200'
                      : isPastSession
                      ? 'bg-slate-100/60 border-slate-200 text-slate-600'
                      : 'bg-white border-slate-200 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            session.completed
                              ? 'bg-emerald-100 text-emerald-800'
                              : isPastSession
                              ? 'bg-slate-200 text-slate-700'
                              : 'bg-indigo-100 text-indigo-800'
                          }`}
                        >
                          {session.completed
                            ? 'Completed'
                            : isPastSession
                            ? 'Past Session'
                            : 'Upcoming'}
                        </span>
                        <span className="text-xs font-semibold text-slate-900">
                          {sessionDate.toLocaleDateString(undefined, {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                          {' @ '}
                          {sessionDate.toLocaleTimeString(undefined, {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 font-medium">
                        {session.partnerType} ({session.durationMinutes} mins)
                      </p>
                      {session.notes && (
                        <p className="text-[11px] text-slate-500 italic mt-0.5 line-clamp-1">
                          "{session.notes}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleToggleComplete(session.id)}
                        className={`p-1.5 rounded-lg text-xs transition-colors ${
                          session.completed
                            ? 'bg-emerald-200 text-emerald-900'
                            : 'hover:bg-slate-100 text-slate-500'
                        }`}
                        title={session.completed ? 'Mark incomplete' : 'Mark completed'}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDownloadSavedIcs(session)}
                        className="p-1.5 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors"
                        title="Re-download .ics Calendar Invite"
                      >
                        {downloadSuccessId === session.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Download className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteSession(session.id)}
                        className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                        title="Delete session"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

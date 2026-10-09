/**
 * Utility for generating RFC 5545 compliant iCalendar (.ics) files
 * and Web Calendar URLs (Google Calendar, Outlook Web).
 */

export interface CalendarEventConfig {
  title: string;
  description: string;
  location?: string;
  startDate: Date;
  durationMinutes: number;
  organizerName?: string;
}

/**
 * Format a Date object to UTC string in iCalendar format: YYYYMMDDTHHmmssZ
 */
function formatUtcToIcs(date: Date): string {
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  const year = date.getUTCFullYear();
  const month = pad(date.getUTCMonth() + 1);
  const day = pad(date.getUTCDate());
  const hours = pad(date.getUTCHours());
  const minutes = pad(date.getUTCMinutes());
  const seconds = pad(date.getUTCSeconds());
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

/**
 * Escape text for iCalendar text fields (newlines -> \n, commas -> \, semicolons -> \;)
 */
function escapeIcsText(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r\n|\n|\r/g, '\\n');
}

/**
 * Generate standard RFC 5545 .ics text string
 */
export function generateIcsContent(config: CalendarEventConfig): string {
  const now = new Date();
  const startUtc = formatUtcToIcs(config.startDate);
  const endDate = new Date(config.startDate.getTime() + config.durationMinutes * 60 * 1000);
  const endUtc = formatUtcToIcs(endDate);
  const stampUtc = formatUtcToIcs(now);
  const uid = `mock-interview-${Date.now()}-${Math.random().toString(36).substring(2, 9)}@bookkaaro.app`;

  const summary = escapeIcsText(config.title);
  const description = escapeIcsText(config.description);
  const location = escapeIcsText(config.location || 'Virtual / Video Call or Self-Practice');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Book Kaaro Career Studio//Mock Interview Scheduler//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${stampUtc}`,
    `DTSTART:${startUtc}`,
    `DTEND:${endUtc}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-PT15M',
    'ACTION:DISPLAY',
    `DESCRIPTION:Reminder: ${summary}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

/**
 * Triggers a browser download of the .ics calendar file
 */
export function downloadIcsFile(config: CalendarEventConfig, filename?: string): void {
  const icsText = generateIcsContent(config);
  const blob = new Blob([icsText], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const cleanTitle = (config.title || 'Mock_Interview')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .substring(0, 30);
  const actualFilename = filename || `${cleanTitle}.ics`;

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', actualFilename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Build a direct web link to Google Calendar
 */
export function buildGoogleCalendarUrl(config: CalendarEventConfig): string {
  const startUtc = formatUtcToIcs(config.startDate);
  const endDate = new Date(config.startDate.getTime() + config.durationMinutes * 60 * 1000);
  const endUtc = formatUtcToIcs(endDate);

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: config.title,
    dates: `${startUtc}/${endUtc}`,
    details: config.description,
    location: config.location || 'Virtual Video Call / Practice Room',
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Build a direct web link to Outlook Web Calendar
 */
export function buildOutlookWebUrl(config: CalendarEventConfig): string {
  const endDate = new Date(config.startDate.getTime() + config.durationMinutes * 60 * 1000);

  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: config.title,
    body: config.description,
    startdt: config.startDate.toISOString(),
    enddt: endDate.toISOString(),
    location: config.location || 'Virtual Video Call',
  });

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

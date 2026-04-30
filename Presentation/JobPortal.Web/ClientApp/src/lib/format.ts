let _timezone = 'Asia/Jakarta';

export function setTimezone(tz: string) {
  _timezone = tz || 'Asia/Jakarta';
}

function safeFormat(iso: string | null | undefined, options: Intl.DateTimeFormatOptions, tz: string): string {
  if (!iso) return '—';
  try {
    return new Intl.DateTimeFormat(undefined, { ...options, timeZone: tz || 'Asia/Jakarta' }).format(new Date(iso));
  } catch {
    return new Intl.DateTimeFormat(undefined, { ...options, timeZone: 'Asia/Jakarta' }).format(new Date(iso));
  }
}

const DATE_OPTS: Intl.DateTimeFormatOptions = {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
};

const DATETIME_OPTS: Intl.DateTimeFormatOptions = {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
};

export function formatDateTime(iso: string | null | undefined, timezone?: string): string {
  return safeFormat(iso, DATETIME_OPTS, timezone ?? _timezone);
}

export function formatDate(iso: string | null | undefined, timezone?: string): string {
  return safeFormat(iso, DATE_OPTS, timezone ?? _timezone);
}

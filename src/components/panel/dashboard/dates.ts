const MEXICO_TZ = "America/Mexico_City";

function ymdInZone(date: Date, timeZone = MEXICO_TZ): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function addDaysYmd(ymd: string, days: number): string {
  const [year, month, day] = ymd.split("-").map(Number);
  const next = new Date(Date.UTC(year, month - 1, day + days));
  const y = next.getUTCFullYear();
  const m = String(next.getUTCMonth() + 1).padStart(2, "0");
  const d = String(next.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function startOfMonthYmd(ymd: string): string {
  return `${ymd.slice(0, 7)}-01`;
}

function addMonthsYmd(ymd: string, months: number): string {
  const [year, month] = ymd.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1 + months, 1));
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}-01`;
}

/** Monday (ISO) of the week that contains `ymd`. */
export function startOfIsoWeekYmd(ymd: string): string {
  const [year, month, day] = ymd.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  const weekday = date.getUTCDay(); // 0 Sun … 6 Sat
  const offset = weekday === 0 ? -6 : 1 - weekday;
  return addDaysYmd(ymd, offset);
}

export function formatWeekLabel(weekStartYmd: string): string {
  const [year, month, day] = weekStartYmd.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(date);
}

export type DashboardDateRanges = {
  today: string;
  plus7: string;
  thisMonthStart: string;
  lastMonthStart: string;
  thisMonthStartIso: string;
  lastMonthStartIso: string;
  thisMonthEndIso: string;
  weekStarts: string[];
};

/**
 * Date windows for dashboard filters. Mexico City calendar days,
 * converted to ISO datetimes for Keystone DateTime fields.
 */
export function getDashboardDateRanges(now = new Date()): DashboardDateRanges {
  const today = ymdInZone(now);
  const thisMonthStart = startOfMonthYmd(today);
  const lastMonthStart = addMonthsYmd(thisMonthStart, -1);
  const nextMonthStart = addMonthsYmd(thisMonthStart, 1);
  const thisWeekStart = startOfIsoWeekYmd(today);
  const weekStarts = Array.from({ length: 8 }, (_, i) =>
    addDaysYmd(thisWeekStart, -7 * (7 - i)),
  );

  return {
    today,
    plus7: addDaysYmd(today, 7),
    thisMonthStart,
    lastMonthStart,
    thisMonthStartIso: `${thisMonthStart}T00:00:00.000-06:00`,
    lastMonthStartIso: `${lastMonthStart}T00:00:00.000-06:00`,
    thisMonthEndIso: `${nextMonthStart}T00:00:00.000-06:00`,
    weekStarts,
  };
}

export function toYmd(value: string | null | undefined): string | null {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return ymdInZone(parsed);
}

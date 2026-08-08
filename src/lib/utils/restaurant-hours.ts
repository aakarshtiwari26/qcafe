// The restaurant operates in a single physical location (IST), independent of where the
// server process or a visiting browser happens to have its clock/timezone set to. Anchoring
// to this explicitly avoids the classic bug where "now" is evaluated in UTC on a production
// server (e.g. Vercel) while opening/closing times were entered in IST by the admin.
const RESTAURANT_TIME_ZONE = "Asia/Kolkata";

function toMinutes(time: string): number | null {
  const match = /^(\d{2}):(\d{2})$/.exec(time);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

function currentMinutesInRestaurantTimeZone(now: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: RESTAURANT_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
  return hour * 60 + minute;
}

/**
 * Handles the overnight case (e.g. opens 18:00, closes 02:00) by wrapping past midnight.
 * Equal opening/closing times are treated as open 24 hours.
 */
export function isWithinOpeningHours(now: Date, openingTime: string, closingTime: string): boolean {
  const openMinutes = toMinutes(openingTime);
  const closeMinutes = toMinutes(closingTime);
  if (openMinutes === null || closeMinutes === null) return true;
  if (openMinutes === closeMinutes) return true;

  const nowMinutes = currentMinutesInRestaurantTimeZone(now);

  if (closeMinutes > openMinutes) {
    return nowMinutes >= openMinutes && nowMinutes < closeMinutes;
  }
  return nowMinutes >= openMinutes || nowMinutes < closeMinutes;
}

/** The admin "Restaurant is currently open" switch is a manual kill-switch on top of the schedule. */
export function isRestaurantOpen(
  settings: { isOpen: boolean; openingTime: string; closingTime: string },
  now: Date = new Date()
): boolean {
  return settings.isOpen && isWithinOpeningHours(now, settings.openingTime, settings.closingTime);
}

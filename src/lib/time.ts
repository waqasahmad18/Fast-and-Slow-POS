export const RESTAURANT_TZ = "Asia/Karachi";

export function restaurantDayKey(value: Date | string = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: RESTAURANT_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

export function restaurantHour(value: Date | string) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: RESTAURANT_TZ,
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(value));
  return Number(parts.find((part) => part.type === "hour")?.value ?? "0");
}

export function isValidDayKey(value?: string): value is string {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T12:00:00+05:00`)));
}

export function clampDayKey(value: string | undefined, today = restaurantDayKey()) {
  if (!isValidDayKey(value) || value > today) return today;
  return value;
}

export function shiftRestaurantDay(dayKey: string, days: number) {
  const date = new Date(`${dayKey}T12:00:00+05:00`);
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  return restaurantDayKey(date);
}

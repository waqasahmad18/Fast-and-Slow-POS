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

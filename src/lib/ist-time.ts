export const IST_TIME_ZONE = "Asia/Kolkata";
export const IST_OFFSET_LABEL = "UTC+05:30";

const timeFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: IST_TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

export function formatIstTime(date: Date): string {
  return timeFormatter.format(date);
}

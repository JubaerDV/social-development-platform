const timeZone = "Asia/Dhaka";

export function formatEventDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone, day: "numeric", month: "short", year: "numeric",
  }).format(new Date(value));
}

export function formatEventDateTime(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone, day: "numeric", month: "short", year: "numeric",
    hour: "numeric", minute: "2-digit", hour12: true,
  }).format(new Date(value));
}

export function toEventInput(value: string | number) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(new Date(value));
  const part = (type: string) => parts.find(item => item.type === type)?.value;
  return `${part("year")}-${part("month")}-${part("day")}T${part("hour")}:${part("minute")}`;
}

export function minimumEventDate() {
  return toEventInput(Date.now() + 60000);
}

export function eventDateToIso(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) {
    throw new Error("Please choose a valid event date and time.");
  }
  const date = new Date(`${value}:00+06:00`);
  if (!Number.isFinite(date.getTime()) || toEventInput(date.toISOString()) !== value) {
    throw new Error("Please choose a valid event date and time.");
  }
  if (date.getTime() <= Date.now()) {
    throw new Error("Event date and time must be in the future.");
  }
  return date.toISOString();
}

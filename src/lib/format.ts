export const CAMPUS_TIME_ZONE = "Asia/Kolkata"

const dayFmt = new Intl.DateTimeFormat("en-IN", {
  weekday: "short",
  day: "numeric",
  month: "short",
  timeZone: CAMPUS_TIME_ZONE,
})
const timeFmt = new Intl.DateTimeFormat("en-IN", {
  hour: "numeric",
  minute: "2-digit",
  timeZone: CAMPUS_TIME_ZONE,
})
const fullDateFmt = new Intl.DateTimeFormat("en-IN", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: CAMPUS_TIME_ZONE,
})
const headerFmt = new Intl.DateTimeFormat("en-IN", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: CAMPUS_TIME_ZONE,
})
const shortDateFmt = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  timeZone: CAMPUS_TIME_ZONE,
})
const dayKeyFmt = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: CAMPUS_TIME_ZONE,
})

export function campusDayKey(date: Date): string {
  return dayKeyFmt.format(date)
}

export function isSameCampusDay(a: Date, b: Date): boolean {
  return campusDayKey(a) === campusDayKey(b)
}

export function formatEventDate(start: Date, end?: Date): string {
  const day = dayFmt.format(start)
  const time = timeFmt.format(start)
  if (!end) return `${day} · ${time}`
  return isSameCampusDay(start, end)
    ? `${day} · ${time}–${timeFmt.format(end)}`
    : `${day} → ${dayFmt.format(end)}`
}

export function formatEventRange(
  start: Date,
  end?: Date
): { date: string; time: string } {
  const startDate = fullDateFmt.format(start)
  const startTime = timeFmt.format(start)
  if (!end) return { date: startDate, time: startTime }
  const sameDay = isSameCampusDay(start, end)
  return {
    date: sameDay ? startDate : `${startDate} – ${fullDateFmt.format(end)}`,
    time: sameDay
      ? `${startTime}–${timeFmt.format(end)}`
      : `${startTime} → ${timeFmt.format(end)}`,
  }
}

export function formatDayHeader(date: Date): string {
  return headerFmt.format(date)
}

export function formatShortDate(date: Date): string {
  return shortDateFmt.format(date)
}

export function bodyPreview(text: string, max = 180): string {
  if (text.length <= max) return text
  return `${text.slice(0, max).replace(/\s+\S*$/, "")}…`
}

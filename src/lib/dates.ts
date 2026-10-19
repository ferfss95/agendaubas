import type { CleaningStatus } from "@/lib/types"

const UTC = "UTC"

export function todayISO(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now)
}

export function parseISODate(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number)
  return new Date(Date.UTC(year, month - 1, day))
}

export function diffDays(from: string, to: string): number {
  const ms = parseISODate(to).getTime() - parseISODate(from).getTime()
  return Math.round(ms / 86_400_000)
}

export function addDays(iso: string, days: number): string {
  const date = parseISODate(iso)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

export function shiftMonth(month: string, delta: number): string {
  const [year, monthNumber] = month.split("-").map(Number)
  const date = new Date(Date.UTC(year, monthNumber - 1 + delta, 1))
  const nextMonth = String(date.getUTCMonth() + 1).padStart(2, "0")
  return `${date.getUTCFullYear()}-${nextMonth}`
}

export function monthKey(iso: string): string {
  return iso.slice(0, 7)
}

export function statusFor(checkout: string, today: string): CleaningStatus {
  if (checkout < today) return "feita"
  if (checkout === today) return "hoje"
  return "agendada"
}

function utcFormat(iso: string, options: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat("pt-BR", { ...options, timeZone: UTC }).format(parseISODate(iso))
}

export function formatMonthTitle(month: string): string {
  const label = utcFormat(`${month}-01`, { month: "long", year: "numeric" })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export function formatMonthTick(month: string, index: number): string {
  const label = utcFormat(`${month}-01`, { month: "short" }).replaceAll(".", "")
  if (index === 0 || month.endsWith("-01")) return `${label} ${month.slice(2, 4)}`
  return label
}

export function formatDay(iso: string): string {
  return utcFormat(iso, { day: "numeric", month: "short" }).replaceAll(".", "")
}

export function formatWeekday(iso: string): string {
  const label = utcFormat(iso, { weekday: "short" }).replaceAll(".", "")
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export function formatFull(iso: string): string {
  const text = utcFormat(iso, { weekday: "long", day: "numeric", month: "long" })
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function formatStay(checkIn: string, checkout: string): string {
  if (checkIn.slice(0, 7) === checkout.slice(0, 7)) {
    return `${Number(checkIn.slice(8))} a ${formatDay(checkout)}`
  }
  return `${formatDay(checkIn)} a ${formatDay(checkout)}`
}

export function formatClock(isoDateTime: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoDateTime))
}

export function nightsLabel(nights: number): string {
  return nights === 1 ? "1 noite" : `${nights} noites`
}

export function dayParts(iso: string): { day: string; month: string } {
  return {
    day: String(parseISODate(iso).getUTCDate()),
    month: utcFormat(iso, { month: "short" }).replaceAll(".", ""),
  }
}

export function nextHint(days: number | null): string {
  if (days === null) return "Nenhuma data futura"
  if (days === 0) return "É hoje"
  if (days === 1) return "Amanhã"
  return `Em ${days} dias`
}

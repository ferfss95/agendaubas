import "server-only"

import { createHash } from "node:crypto"

import { diffDays, formatMonthTick, monthKey, shiftMonth, statusFor, todayISO } from "@/lib/dates"
import { parseIcal } from "@/lib/ical"
import { rememberCleanings, type StoredCleaning } from "@/lib/history-store"
import { PROPERTY } from "@/lib/property"
import type { Cleaning, MonthBar, Schedule } from "@/lib/types"

const TTL_MS = 60_000

export class ScheduleError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "ScheduleError"
  }
}

let cache: { at: number; data: Schedule } | null = null
let pending: Promise<Schedule> | null = null

export function getSchedule(force = false): Promise<Schedule> {
  if (!force && cache && Date.now() - cache.at < TTL_MS) return Promise.resolve(cache.data)
  if (!force && pending) return pending

  const run = buildSchedule().then((data) => {
    cache = { at: Date.now(), data }
    return data
  })

  if (force) return run

  pending = run.finally(() => {
    pending = null
  })
  return pending
}

async function buildSchedule(): Promise<Schedule> {
  const today = todayISO()
  const parsed = parseIcal(await fetchIcal(readCalendarUrl()))
  const reservations = parsed.filter((event) => !event.blocked)
  const current = reservations.map(toStored)
  const merged = await rememberCleanings(current, today)
  const checkIns = new Set(merged.map((item) => item.checkIn))

  const cleanings: Cleaning[] = merged
    .map((item) => ({
      ...item,
      status: statusFor(item.checkout, today),
      turnover: checkIns.has(item.checkout) && item.checkIn !== item.checkout,
    }))
    .sort((a, b) => a.checkout.localeCompare(b.checkout) || a.checkIn.localeCompare(b.checkIn))

  const feitas = cleanings.filter((item) => item.status === "feita").length
  const hoje = cleanings.filter((item) => item.status === "hoje").length
  const agendadas = cleanings.filter((item) => item.status === "agendada").length
  const next = cleanings.find((item) => item.status !== "feita") ?? null

  return {
    property: PROPERTY,
    syncedAt: new Date().toISOString(),
    today,
    ignoredBlocks: parsed.length - reservations.length,
    stats: {
      feitas,
      agendadas,
      hoje,
      pendentes: hoje + agendadas,
      total: cleanings.length,
      nextCheckout: next?.checkout ?? null,
      daysUntilNext: next ? diffDays(today, next.checkout) : null,
    },
    cleanings,
    months: buildMonths(today, cleanings),
  }
}

function readCalendarUrl(): string {
  const url = process.env.AIRBNB_ICAL_URL?.trim()
  if (!url) throw new ScheduleError("O calendário ainda não está configurado.")
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== "https:") throw new Error("protocol")
  } catch {
    throw new ScheduleError("O link do calendário é inválido.")
  }
  return url
}

async function fetchIcal(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        Accept: "text/calendar, text/plain, */*",
        "User-Agent": "AgendaLimpeza/1.0",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(12_000),
    })
    if (!response.ok) throw new ScheduleError("O Airbnb não respondeu o calendário.")
    const text = await response.text()
    if (!text.includes("BEGIN:VCALENDAR")) {
      throw new ScheduleError("A resposta do calendário veio em um formato inesperado.")
    }
    return text
  } catch (error) {
    if (error instanceof ScheduleError) throw error
    throw new ScheduleError("Não foi possível ler o calendário do Airbnb agora.")
  }
}

function toStored(event: { uid: string; checkIn: string; checkout: string; guestFirstName: string | null }): StoredCleaning {
  return {
    id: createHash("sha256").update(event.uid).digest("hex").slice(0, 16),
    checkIn: event.checkIn,
    checkout: event.checkout,
    nights: diffDays(event.checkIn, event.checkout),
    guestFirstName: event.guestFirstName,
  }
}

function buildMonths(today: string, cleanings: Cleaning[]): MonthBar[] {
  const current = today.slice(0, 7)
  let start = shiftMonth(current, -2)
  let end = shiftMonth(current, 5)

  for (const cleaning of cleanings) {
    const month = monthKey(cleaning.checkout)
    if (month < start) start = month
    if (month > end) end = month
  }

  const months: string[] = []
  let cursor = start
  while (cursor <= end && months.length < 24) {
    months.push(cursor)
    cursor = shiftMonth(cursor, 1)
  }

  const visible = months.length <= 12 ? months : windowAround(months, current)
  return visible.map((month, index) => ({
    month,
    label: formatMonthTick(month, index),
    feitas: cleanings.filter((item) => monthKey(item.checkout) === month && item.status === "feita").length,
    pendentes: cleanings.filter((item) => monthKey(item.checkout) === month && item.status !== "feita").length,
  }))
}

function windowAround(months: string[], current: string): string[] {
  const index = Math.max(0, months.indexOf(current))
  const from = Math.min(Math.max(0, index - 2), Math.max(0, months.length - 12))
  return months.slice(from, from + 12)
}

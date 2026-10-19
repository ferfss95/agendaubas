import "server-only"

import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises"
import path from "node:path"

export type StoredCleaning = {
  id: string
  checkIn: string
  checkout: string
  nights: number
  guestFirstName: string | null
}

const filePath = path.join(process.cwd(), "data", "cleanings.json")
let queue: Promise<unknown> = Promise.resolve()

export function rememberCleanings(current: StoredCleaning[], today: string): Promise<StoredCleaning[]> {
  return exclusive(async () => {
    const previous = await readStore()
    const merged = merge(current, previous, today)
    try {
      await writeStore(merged)
    } catch {
      // Na hospedagem o disco some a cada visita. A agenda segue com o calendário ao vivo.
    }
    return merged
  })
}

function exclusive<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(task, task)
  queue = run.then(
    () => undefined,
    () => undefined,
  )
  return run
}

function merge(current: StoredCleaning[], previous: StoredCleaning[], today: string): StoredCleaning[] {
  const currentIds = new Set(current.map((item) => item.id))
  const history = previous.filter((item) => item.checkout < today && !currentIds.has(item.id))
  return [...current, ...history]
    .sort((a, b) => b.checkout.localeCompare(a.checkout))
    .slice(0, 400)
    .sort((a, b) => a.checkout.localeCompare(b.checkout) || a.checkIn.localeCompare(b.checkIn))
}

async function readStore(): Promise<StoredCleaning[]> {
  try {
    const raw = await readFile(filePath, "utf8")
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isStored)
  } catch {
    return []
  }
}

async function writeStore(items: StoredCleaning[]): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true })
  const temporary = `${filePath}.tmp`
  await writeFile(temporary, JSON.stringify(items, null, 2), "utf8")
  try {
    await rename(temporary, filePath)
  } catch {
    await writeFile(filePath, JSON.stringify(items, null, 2), "utf8")
    await rm(temporary, { force: true })
  }
}

function isStored(value: unknown): value is StoredCleaning {
  if (!value || typeof value !== "object") return false
  const item = value as Partial<StoredCleaning>
  return (
    typeof item.id === "string" &&
    /^[a-f0-9]{16}$/.test(item.id) &&
    typeof item.checkIn === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(item.checkIn) &&
    typeof item.checkout === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(item.checkout) &&
    typeof item.nights === "number" &&
    item.nights > 0 &&
    (item.guestFirstName === null || typeof item.guestFirstName === "string")
  )
}

import "server-only"

const BLOCKED = /not available|unavailable|blocked|indispon[ií]vel|bloquead/i
const GENERIC =
  /^(reserved|reservation|reservado|reserva|airbnb|busy|ocupado|bloqueado|blocked|indispon[ií]vel|fechado)$/i

export type ParsedEvent = {
  uid: string
  checkIn: string
  checkout: string
  blocked: boolean
  guestFirstName: string | null
}

export function parseIcal(raw: string): ParsedEvent[] {
  const text = unfold(raw)
  const events: ParsedEvent[] = []

  for (const chunk of text.split("BEGIN:VEVENT").slice(1)) {
    const body = chunk.split("END:VEVENT")[0] ?? ""
    const fields = readFields(body)
    const checkIn = dateOnly(fields.get("DTSTART"))
    const checkout = dateOnly(fields.get("DTEND"))
    if (!checkIn || !checkout || checkout <= checkIn) continue

    const summary = unescapeText(fields.get("SUMMARY") ?? "")
    const uid = (fields.get("UID") ?? `${checkIn}:${checkout}:${summary}`).trim()
    const blocked = BLOCKED.test(summary)

    events.push({
      uid,
      checkIn,
      checkout,
      blocked,
      guestFirstName: blocked ? null : firstName(summary),
    })
  }

  return events
}

function unfold(raw: string): string {
  return raw
    .replace(/^\uFEFF/, "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\n[ \t]/g, "")
}

function readFields(body: string): Map<string, string> {
  const fields = new Map<string, string>()
  for (const line of body.split("\n")) {
    if (!line || line.startsWith("BEGIN:") || line.startsWith("END:")) continue
    const separator = line.indexOf(":")
    if (separator === -1) continue
    const key = line.slice(0, separator).split(";")[0]?.toUpperCase()
    if (!key || fields.has(key)) continue
    fields.set(key, line.slice(separator + 1).trim())
  }
  return fields
}

function dateOnly(value: string | undefined): string | null {
  const match = value?.match(/(\d{4})(\d{2})(\d{2})/)
  if (!match) return null
  return `${match[1]}-${match[2]}-${match[3]}`
}

function unescapeText(value: string): string {
  return value
    .replace(/\\n/gi, " ")
    .replace(/\\,/g, ",")
    .replace(/\\;/g, ";")
    .replace(/\\\\/g, "\\")
    .trim()
}

function firstName(summary: string): string | null {
  if (!summary || GENERIC.test(summary) || BLOCKED.test(summary)) return null
  if (/[@\d]|https?:|www\./i.test(summary)) return null
  const token = summary.split(/\s+/)[0] ?? ""
  if (!/^[\p{L}][\p{L}'’-]*$/u.test(token)) return null
  if (token.length < 2 || token.length > 24) return null
  return token.charAt(0).toUpperCase() + token.slice(1).toLowerCase()
}

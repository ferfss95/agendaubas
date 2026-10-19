import { addDays, formatDay, formatFull, formatMonthTitle, nightsLabel, shiftMonth } from "@/lib/dates"
import type { Cleaning, CleaningStatus } from "@/lib/types"

const WEEKDAYS = ["seg", "ter", "qua", "qui", "sex", "sáb", "dom"]

type MonthCalendarProps = {
  month: string
  today: string
  cleanings: Cleaning[]
  selected: string | null
  onMonth: (month: string) => void
  onSelect: (iso: string) => void
}

export function MonthCalendar({ month, today, cleanings, selected, onMonth, onSelect }: MonthCalendarProps) {
  const cells = monthCells(month)
  const line = selectionLine(selected, cleanings)

  return (
    <section className="rounded-2xl border border-line bg-paper p-4 sm:p-5">
      <div className="flex items-center gap-1">
        <IconButton label="Mês anterior" onClick={() => onMonth(shiftMonth(month, -1))}>
          ‹
        </IconButton>
        <h2 className="min-w-0 px-1 text-base font-semibold tracking-tight text-deep">{formatMonthTitle(month)}</h2>
        <IconButton label="Próximo mês" onClick={() => onMonth(shiftMonth(month, 1))}>
          ›
        </IconButton>
        {month !== today.slice(0, 7) ? (
          <button type="button" onClick={() => onSelect(today)} className="ml-auto text-sm text-mist hover:text-deep">
            Hoje
          </button>
        ) : null}
      </div>

      <div className="mt-4 grid grid-cols-7 text-center text-[11px] font-medium text-mist">
        {WEEKDAYS.map((day) => (
          <div key={day} className="py-1">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((cell) => {
          const mark = dayMark(cell.iso, cleanings)
          const isSelected = selected === cell.iso
          return (
            <button
              key={cell.iso}
              type="button"
              onClick={() => onSelect(cell.iso)}
              aria-pressed={isSelected}
              aria-label={dayLabel(cell.iso, mark)}
              className="relative h-11 min-w-0"
            >
              {mark.bar ? (
                <span className={barClass(mark.continuesLeft, mark.continuesRight, barTone())} />
              ) : null}
              <span className={numberClass(cell.inMonth, cell.iso === today, isSelected, mark.checkout)}>
                {Number(cell.iso.slice(8))}
              </span>
            </button>
          )
        })}
      </div>

      <div className="mt-4 flex gap-4 text-xs text-mist">
        <span className="inline-flex items-center gap-2">
          <span className="h-2 w-6 rounded-full bg-deep/10" />
          Estadia
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-deep" />
          Limpeza
        </span>
      </div>

      {line ? <p className="mt-3 text-sm text-deep">{line}</p> : null}
    </section>
  )
}

type Mark = {
  bar: boolean
  continuesLeft: boolean
  continuesRight: boolean
  checkout: CleaningStatus | null
}

function dayMark(iso: string, cleanings: Cleaning[]): Mark {
  const checkout = cleanings.find((item) => item.checkout === iso) ?? null
  const continuesLeft = cleanings.some((item) => item.checkIn < iso && iso <= item.checkout)
  const continuesRight = cleanings.some((item) => item.checkIn <= iso && iso < item.checkout)
  return {
    bar: continuesLeft || continuesRight,
    continuesLeft,
    continuesRight,
    checkout: checkout?.status ?? null,
  }
}

function selectionLine(iso: string | null, cleanings: Cleaning[]): string | null {
  if (!iso) return null
  const checkout = cleanings.find((item) => item.checkout === iso)
  const stay = cleanings.find((item) => item.checkIn <= iso && iso < item.checkout)
  if (checkout) {
    const name = checkout.guestFirstName ? ` · ${checkout.guestFirstName}` : ""
    const turn = checkout.turnover ? " · virada" : ""
    return `Limpeza · ${nightsLabel(checkout.nights)}${name}${turn}`
  }
  if (stay) return `Estadia · limpeza ${formatDay(stay.checkout)}`
  return null
}

function monthCells(month: string): { iso: string; inMonth: boolean }[] {
  const [year, monthNumber] = month.split("-").map(Number)
  const offset = (new Date(Date.UTC(year, monthNumber - 1, 1)).getUTCDay() + 6) % 7
  const daysInMonth = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate()
  const cells: { iso: string; inMonth: boolean }[] = []

  for (let index = 0; index < offset; index += 1) {
    cells.push({ iso: addDays(`${month}-01`, index - offset), inMonth: false })
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({ iso: `${month}-${String(day).padStart(2, "0")}`, inMonth: true })
  }
  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1]
    if (!last) break
    cells.push({ iso: addDays(last.iso, 1), inMonth: false })
  }
  return cells
}

function barClass(left: boolean, right: boolean, tone: string): string {
  const start = left ? "left-0" : "left-1/2 rounded-l-full"
  const end = right ? "right-0" : "right-1/2 rounded-r-full"
  return `absolute inset-y-1.5 ${start} ${end} ${tone}`
}

function barTone(): string {
  return "bg-deep/10"
}

function numberClass(inMonth: boolean, isToday: boolean, selected: boolean, checkout: CleaningStatus | null): string {
  const base = "relative z-10 mx-auto grid h-8 w-8 place-items-center rounded-full text-sm tabular-nums"
  if (!inMonth && !checkout) return `${base} text-mist/35`
  if (checkout === "hoje") return `${base} bg-today font-semibold text-white`
  if (checkout === "feita") return `${base} bg-done font-semibold text-white`
  if (checkout === "agendada") return `${base} bg-deep font-semibold text-white`
  if (selected) return `${base} ring-2 ring-deep ${isToday ? "font-semibold text-deep" : "text-ink"}`
  if (isToday) return `${base} font-semibold text-deep ring-1 ring-deep/30`
  return `${base} ${inMonth ? "text-ink" : "text-mist/50"}`
}

function dayLabel(iso: string, mark: Mark): string {
  const date = formatFull(iso)
  if (mark.checkout) return `${date}, limpeza`
  if (mark.bar) return `${date}, estadia`
  return date
}

function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="grid h-8 w-8 place-items-center rounded-full text-lg text-deep hover:bg-foam"
    >
      {children}
    </button>
  )
}

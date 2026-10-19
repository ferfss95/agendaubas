import { dayParts, formatStay, formatWeekday, nightsLabel } from "@/lib/dates"
import type { Cleaning, CleaningStatus, ListFilter } from "@/lib/types"

const FILTERS: { id: ListFilter; label: string }[] = [
  { id: "pendentes", label: "A fazer" },
  { id: "feitas", label: "Feitas" },
  { id: "todas", label: "Todas" },
]

type CleaningListProps = {
  cleanings: Cleaning[]
  filter: ListFilter
  onFilter: (filter: ListFilter) => void
  selected: string | null
  onSelect: (iso: string) => void
}

export function CleaningList({ cleanings, filter, onFilter, selected, onSelect }: CleaningListProps) {
  const visible = visibleCleanings(cleanings, filter)
  const counts = {
    pendentes: cleanings.filter((item) => item.status !== "feita").length,
    feitas: cleanings.filter((item) => item.status === "feita").length,
    todas: cleanings.length,
  }

  return (
    <section className="flex flex-col rounded-2xl border border-line bg-paper p-4 sm:p-5">
      <h2 className="text-base font-semibold tracking-tight text-deep">Limpezas</h2>
      <div className="mt-3 flex flex-wrap gap-1" role="tablist" aria-label="Filtrar limpezas">
        {FILTERS.map((item) => {
          const active = filter === item.id
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onFilter(item.id)}
              className={
                active
                  ? "rounded-full bg-deep px-3 py-1 text-sm font-medium text-white"
                  : "rounded-full px-3 py-1 text-sm text-mist"
              }
            >
              {item.label}
              <span className="ml-1 tabular-nums">{counts[item.id]}</span>
            </button>
          )
        })}
      </div>

      {visible.length === 0 ? (
        <p className="mt-6 text-sm text-mist">Nenhuma limpeza.</p>
      ) : (
        <ul className="mt-3 flex max-h-[560px] flex-col overflow-auto">
          {visible.map((cleaning) => {
            const parts = dayParts(cleaning.checkout)
            const active = selected === cleaning.checkout
            return (
              <li key={cleaning.id} className="border-t border-line first:border-t-0">
                <button
                  type="button"
                  onClick={() => onSelect(cleaning.checkout)}
                  className={`flex w-full items-center gap-3 rounded-xl px-2 py-3 text-left ${active ? "bg-foam" : ""}`}
                >
                  <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl text-white ${ticketTone(cleaning.status)}`}>
                    <span className="text-lg font-semibold leading-none tabular-nums">{parts.day}</span>
                    <span className="text-[10px] uppercase tracking-wide text-white/75">{parts.month}</span>
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-deep">
                      {formatWeekday(cleaning.checkout)} · {nightsLabel(cleaning.nights)}
                    </span>
                    <span className="mt-0.5 block truncate text-sm text-mist">
                      {formatStay(cleaning.checkIn, cleaning.checkout)}
                      {cleaning.guestFirstName ? ` · ${cleaning.guestFirstName}` : ""}
                      {cleaning.turnover ? " · virada" : ""}
                    </span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

function visibleCleanings(cleanings: Cleaning[], filter: ListFilter): Cleaning[] {
  const items = cleanings.filter((item) => {
    if (filter === "pendentes") return item.status !== "feita"
    if (filter === "feitas") return item.status === "feita"
    return true
  })
  return [...items].sort((a, b) =>
    filter === "feitas" ? b.checkout.localeCompare(a.checkout) : a.checkout.localeCompare(b.checkout),
  )
}

function ticketTone(status: CleaningStatus): string {
  if (status === "hoje") return "bg-today"
  if (status === "feita") return "bg-done"
  return "bg-deep"
}

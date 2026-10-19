import { dayParts, nextHint } from "@/lib/dates"
import type { Schedule } from "@/lib/types"

const cardClass = "rounded-2xl border border-line bg-paper px-4 py-4"

export function Overview({ schedule }: { schedule: Schedule }) {
  const { stats } = schedule
  const next = stats.nextCheckout ? dayParts(stats.nextCheckout) : null

  return (
    <section id="resumo" className="scroll-mt-20 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <article className={cardClass}>
        <p className="text-xs font-medium text-mist">A fazer</p>
        <p className="mt-2 text-4xl font-semibold tracking-tight text-deep tabular-nums">{stats.pendentes}</p>
      </article>
      <article className={`${cardClass} ${stats.hoje > 0 ? "border-today/40" : ""}`}>
        <p className="text-xs font-medium text-mist">Hoje</p>
        <p className="mt-2 text-4xl font-semibold tracking-tight text-today tabular-nums">{stats.hoje}</p>
      </article>
      <article className={cardClass}>
        <p className="text-xs font-medium text-mist">Feitas</p>
        <p className="mt-2 text-4xl font-semibold tracking-tight text-done tabular-nums">{stats.feitas}</p>
      </article>
      <article className={cardClass}>
        <p className="text-xs font-medium text-mist">Próxima</p>
        {next ? (
          <p className="mt-2 text-4xl font-semibold tracking-tight text-deep tabular-nums">
            {next.day}
            <span className="ml-1.5 text-lg font-medium text-mist">{next.month}</span>
          </p>
        ) : (
          <p className="mt-2 text-4xl font-semibold tracking-tight text-deep">—</p>
        )}
        <p className="mt-1 text-xs text-mist">{nextHint(stats.daysUntilNext)}</p>
      </article>
    </section>
  )
}

import type { ReactNode } from "react"

import { dayParts, nextHint } from "@/lib/dates"
import { PROPERTY } from "@/lib/property"
import type { Schedule } from "@/lib/types"

const cardClass =
  "flex h-full min-w-0 flex-col items-center justify-center rounded-2xl border border-line bg-paper px-3 py-3 text-center sm:px-4 sm:py-4"

export function Overview({ schedule }: { schedule: Schedule }) {
  const { stats } = schedule
  const next = stats.nextCheckout ? dayParts(stats.nextCheckout) : null

  return (
    <section
      id="resumo"
      className="scroll-mt-20 grid items-center gap-2.5 md:grid-cols-[22rem_minmax(0,1fr)] md:gap-4 lg:grid-cols-[30rem_minmax(0,1fr)]"
    >
      <figure className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-line">
        <img
          src={PROPERTY.image}
          alt="Sala do apartamento em Itaguá"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
      </figure>
      <div className="grid grid-cols-2 grid-rows-2 gap-2 sm:gap-3">
        <Stat label="A fazer" value={stats.pendentes} />
        <Stat
          label="Hoje"
          value={stats.hoje}
          tone="text-today"
          accent={stats.hoje > 0 ? "border-today/40 bg-today/15" : ""}
        />
        <Stat label="Feitas" value={stats.feitas} tone="text-done" />
        <Stat
          label="Próxima"
          value={
            next ? (
              <>
                {next.day}
                <span className="ml-1 text-lg font-medium leading-none text-mist sm:text-2xl">{next.month}</span>
              </>
            ) : (
              "—"
            )
          }
          hint={nextHint(stats.daysUntilNext)}
        />
      </div>
    </section>
  )
}

function Stat({
  label,
  value,
  hint,
  tone = "text-deep",
  accent = "",
}: {
  label: string
  value: ReactNode
  hint?: string
  tone?: string
  accent?: string
}) {
  return (
    <article className={`${cardClass} ${accent}`}>
      <p className="text-[11px] font-medium text-mist sm:text-xs">{label}</p>
      <p
        className={`mt-1 flex h-12 items-baseline justify-center whitespace-nowrap text-4xl font-semibold leading-none tracking-tight tabular-nums sm:h-16 sm:text-6xl ${tone}`}
      >
        {value}
      </p>
      <p className="mt-1 h-4 text-[11px] leading-4 text-mist sm:text-xs">{hint ?? "\u00a0"}</p>
    </article>
  )
}

import type { MonthBar } from "@/lib/types"

export function ActivityChart({ months }: { months: MonthBar[] }) {
  const max = Math.max(1, ...months.map((month) => month.feitas + month.pendentes))
  const feitas = months.reduce((sum, month) => sum + month.feitas, 0)
  const pendentes = months.reduce((sum, month) => sum + month.pendentes, 0)

  return (
    <section id="por-mes" className="scroll-mt-20 rounded-2xl border border-line bg-paper p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold tracking-tight text-deep">Por mês</h2>
        <div className="flex gap-4 text-xs text-mist">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-deep" />
            {pendentes} a fazer
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-done" />
            {feitas} feitas
          </span>
        </div>
      </div>

      <div className="mt-4 flex h-36 items-end gap-2" role="img" aria-label={chartLabel(months)}>
        {months.map((month) => {
          const total = month.feitas + month.pendentes
          const height = total === 0 ? 0 : Math.max(8, Math.round((total / max) * 80))
          const doneHeight = total === 0 ? 0 : Math.round((month.feitas / total) * height)
          const pendingHeight = height - doneHeight
          return (
            <div key={month.month} className="flex min-w-0 flex-1 flex-col items-center gap-2">
              <span className="h-4 text-xs font-medium text-deep tabular-nums">{total > 0 ? total : ""}</span>
              <div className="flex h-24 w-full items-end justify-center">
                <div
                  className="flex w-full max-w-8 flex-col justify-end overflow-hidden rounded-md bg-foam"
                  style={{ height: Math.max(height, 3) }}
                  title={`${month.label}: ${month.pendentes} a fazer, ${month.feitas} feitas`}
                >
                  <div className="bg-deep" style={{ height: pendingHeight }} />
                  <div className="bg-done" style={{ height: doneHeight }} />
                </div>
              </div>
              <span className="truncate text-[11px] text-mist">{month.label}</span>
            </div>
          )
        })}
      </div>

      <table className="sr-only">
        <caption>Limpezas por mês</caption>
        <thead>
          <tr>
            <th>Mês</th>
            <th>A fazer</th>
            <th>Feitas</th>
          </tr>
        </thead>
        <tbody>
          {months.map((month) => (
            <tr key={month.month}>
              <td>{month.label}</td>
              <td>{month.pendentes}</td>
              <td>{month.feitas}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

function chartLabel(months: MonthBar[]): string {
  return months.map((month) => `${month.label}: ${month.pendentes} a fazer e ${month.feitas} feitas`).join(". ")
}

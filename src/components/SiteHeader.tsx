import { formatClock } from "@/lib/dates"

const LINKS = [
  ["#resumo", "Resumo"],
  ["#calendario", "Calendário"],
  ["#por-mes", "Mês"],
] as const

type SiteHeaderProps = {
  syncedAt: string
  refreshing: boolean
  onRefresh: () => void
}

export function SiteHeader({ syncedAt, refreshing, onRefresh }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-foam/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3 sm:px-6">
        <a href="#resumo" className="text-sm font-semibold tracking-tight text-deep">
          Itaguá
        </a>
        <nav className="order-3 flex w-full gap-1 text-sm sm:order-none sm:w-auto" aria-label="Seções">
          {LINKS.map(([href, label]) => (
            <a key={href} href={href} className="rounded-full px-2.5 py-1 text-mist hover:bg-paper hover:text-deep">
              {label}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <p className="text-xs tabular-nums text-mist">{formatClock(syncedAt)}</p>
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="rounded-full bg-deep px-3 py-1.5 text-sm font-medium text-white disabled:opacity-60"
          >
            {refreshing ? "Atualizando" : "Atualizar"}
          </button>
        </div>
      </div>
    </header>
  )
}

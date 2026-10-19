import { formatClock } from "@/lib/dates"

type SiteHeaderProps = {
  syncedAt: string
  refreshing: boolean
  onRefresh: () => void
}

export function SiteHeader({ syncedAt, refreshing, onRefresh }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-foam">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3 sm:px-6">
        <a href="#resumo" className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-ocean text-white">
            <WaveMark />
          </span>
          <span>
            <span className="block text-sm font-semibold tracking-tight text-deep">Agenda de Limpeza</span>
            <span className="block text-xs text-mist">Itaguá, Ubatuba</span>
          </span>
        </a>
        <div className="ml-auto flex items-center gap-3">
          <p className="text-xs tabular-nums text-mist">Atualizado {formatClock(syncedAt)}</p>
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="rounded-full border border-deep/25 px-3 py-1.5 text-sm font-medium text-deep disabled:opacity-60"
          >
            {refreshing ? "Atualizando" : "Atualizar"}
          </button>
        </div>
      </div>
    </header>
  )
}

function WaveMark() {
  return (
    <svg viewBox="0 0 32 32" className="h-5 w-5" aria-hidden="true">
      <path
        d="M3 14c3 0 3-4 6.5-4S13 14 16.5 14 20 10 23.5 10 27 14 30 14"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M3 21c3 0 3-3 6.5-3S13 21 16.5 21 20 18 23.5 18 27 21 30 21"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  )
}

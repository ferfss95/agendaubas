"use client"

import { useCallback, useEffect, useState } from "react"

import { ActivityChart } from "@/components/ActivityChart"
import { CleaningList } from "@/components/CleaningList"
import { MonthCalendar } from "@/components/MonthCalendar"
import { Overview } from "@/components/Overview"
import { SiteHeader } from "@/components/SiteHeader"
import type { ListFilter, Schedule } from "@/lib/types"

export function Dashboard({ initial }: { initial: Schedule }) {
  const [data, setData] = useState(initial)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [month, setMonth] = useState(initial.today.slice(0, 7))
  const [selected, setSelected] = useState<string | null>(initial.stats.nextCheckout ?? initial.today)
  const [filter, setFilter] = useState<ListFilter>("pendentes")

  function selectDate(iso: string) {
    setSelected(iso)
    setMonth(iso.slice(0, 7))
  }

  const refresh = useCallback(async (manual = false) => {
    if (manual) {
      setRefreshing(true)
      setError(null)
    }
    try {
      const response = await fetch("/api/calendar?refresh=1", { cache: "no-store" })
      const body = (await response.json()) as Schedule | { error?: string }
      if (!response.ok || !("cleanings" in body)) {
        const message = "error" in body && body.error ? body.error : "Não foi possível atualizar."
        throw new Error(message)
      }
      setData(body)
      setError(null)
    } catch (cause) {
      if (manual) setError(cause instanceof Error ? cause.message : "Não foi possível atualizar.")
    } finally {
      if (manual) setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    const pull = () => {
      if (document.visibilityState === "visible") void refresh(false)
    }
    const timer = window.setInterval(pull, 60_000)
    document.addEventListener("visibilitychange", pull)
    return () => {
      window.clearInterval(timer)
      document.removeEventListener("visibilitychange", pull)
    }
  }, [refresh])

  return (
    <>
      <SiteHeader syncedAt={data.syncedAt} refreshing={refreshing} onRefresh={() => void refresh(true)} />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-5 sm:px-6 sm:py-6">
        {error ? (
          <p className="rounded-xl bg-today/10 px-4 py-3 text-sm text-deep" role="alert">
            {error}
          </p>
        ) : null}
        <Overview schedule={data} />
        <section className="grid scroll-mt-20 items-start gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.85fr)]" id="calendario">
          <MonthCalendar
            month={month}
            today={data.today}
            cleanings={data.cleanings}
            selected={selected}
            onMonth={setMonth}
            onSelect={selectDate}
          />
          <CleaningList
            cleanings={data.cleanings}
            filter={filter}
            onFilter={setFilter}
            selected={selected}
            onSelect={selectDate}
          />
        </section>
        <ActivityChart months={data.months} />
      </main>
    </>
  )
}

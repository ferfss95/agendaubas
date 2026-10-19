import { Suspense } from "react"

import { Dashboard } from "@/components/Dashboard"
import { LoadError } from "@/components/LoadError"
import { Skeleton } from "@/components/Skeleton"
import { getSchedule } from "@/lib/schedule"

export const dynamic = "force-dynamic"

export default function Page() {
  return (
    <Suspense fallback={<Skeleton />}>
      <Agenda />
    </Suspense>
  )
}

async function Agenda() {
  try {
    const schedule = await getSchedule()
    return <Dashboard initial={schedule} />
  } catch (error) {
    const message = error instanceof Error ? error.message : "Não foi possível ler o calendário."
    return <LoadError message={message} />
  }
}

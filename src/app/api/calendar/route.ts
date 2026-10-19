import { NextResponse } from "next/server"

import { getSchedule, ScheduleError } from "@/lib/schedule"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const force = new URL(request.url).searchParams.get("refresh") === "1"
  try {
    const schedule = await getSchedule(force)
    return NextResponse.json(schedule, { headers: { "Cache-Control": "no-store" } })
  } catch (error) {
    const message =
      error instanceof ScheduleError ? error.message : "Não foi possível ler o calendário do Airbnb agora."
    return NextResponse.json({ error: message }, { status: 502, headers: { "Cache-Control": "no-store" } })
  }
}

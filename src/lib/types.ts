export type CleaningStatus = "feita" | "hoje" | "agendada"

export type ListFilter = "pendentes" | "feitas" | "todas"

export type Cleaning = {
  id: string
  checkIn: string
  checkout: string
  nights: number
  guestFirstName: string | null
  status: CleaningStatus
  turnover: boolean
}

export type MonthBar = {
  month: string
  label: string
  feitas: number
  pendentes: number
}

export type ScheduleStats = {
  feitas: number
  agendadas: number
  hoje: number
  pendentes: number
  total: number
  nextCheckout: string | null
  daysUntilNext: number | null
}

export type Schedule = {
  property: {
    name: string
    location: string
    detail: string
    image: string
  }
  syncedAt: string
  today: string
  ignoredBlocks: number
  stats: ScheduleStats
  cleanings: Cleaning[]
  months: MonthBar[]
}

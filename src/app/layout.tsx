import type { Metadata } from "next"
import { Geist } from "next/font/google"

import "./globals.css"

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Agenda de Limpeza · Itaguá",
  description: "Limpezas no dia do checkout.",
  robots: { index: false, follow: false },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={geist.variable}>
      <body className="bg-foam font-sans text-ink antialiased">{children}</body>
    </html>
  )
}

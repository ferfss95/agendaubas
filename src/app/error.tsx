"use client"

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center px-6">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-ocean">Agenda de limpeza</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-deep">O calendário não abriu</h1>
      <p className="mt-3 leading-relaxed text-mist">
        {error.message || "Tente de novo em alguns instantes."}
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 w-fit rounded-full bg-ocean px-5 py-2.5 text-sm font-semibold text-white"
      >
        Tentar de novo
      </button>
    </main>
  )
}

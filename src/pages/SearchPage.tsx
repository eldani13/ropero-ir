import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { SiteFooter } from '../components/SiteFooter'

export function SearchPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  function goSearch(term: string) {
    const value = term.trim()
    if (!value) return
    navigate(`/resultados?q=${encodeURIComponent(value)}`)
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    goSearch(query)
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <main className="relative mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col justify-center px-4 py-8 sm:px-5 sm:py-10">
        <header className="mb-8 text-center sm:mb-10">
          <h1 className="font-display text-[clamp(2rem,10vw,4.5rem)] leading-none font-bold tracking-[0.04em] text-[var(--ink)] uppercase">
            RoperoIR
          </h1>
          <p className="mx-auto mt-3 max-w-[22rem] text-[15px] text-[var(--ink-secondary)] sm:mt-4 sm:max-w-none sm:text-[17px]">
            Base de datos de espectros infrarrojos
          </p>
        </header>

        <form onSubmit={onSubmit} className="w-full">
          <label className="sr-only" htmlFor="search-compuesto">
            Ingresa un compuesto químico
          </label>
          <div className="flex items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--line)] bg-[var(--bg-elevated)] px-4 py-3 shadow-[var(--shadow)] backdrop-blur-xl transition focus-within:border-[rgba(0,113,227,0.35)] focus-within:shadow-[0_10px_40px_rgba(0,113,227,0.12)] sm:gap-3 sm:px-5 sm:py-3.5">
            <SearchIcon />
            <input
              id="search-compuesto"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ingresa un compuesto químico"
              autoComplete="off"
              autoFocus
              className="min-w-0 flex-1 bg-transparent text-[15px] text-[var(--ink)] outline-none placeholder:text-[var(--ink-tertiary)] sm:text-[17px]"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="shrink-0 rounded-full px-2 py-1 text-[12px] text-[var(--ink-secondary)] hover:bg-black/5 sm:text-[13px]"
                aria-label="Limpiar búsqueda"
              >
                Limpiar
              </button>
            ) : null}
          </div>
        </form>
      </main>

      <SiteFooter />
    </div>
  )
}

function SearchIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="shrink-0 text-[var(--ink-tertiary)]"
    >
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M20 20L16.5 16.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

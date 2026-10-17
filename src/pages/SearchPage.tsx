import { useState, type FormEvent } from 'react'
import { FiSearch, FiX } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { SiteFooter } from '../components/SiteFooter'
import { alertWarning } from '../lib/alerts'

export function SearchPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  function goSearch(term: string) {
    const value = term.trim()
    if (!value) {
      void alertWarning(
        'Campo vacío',
        'Ingresa un compuesto químico para buscar.',
      )
      return
    }
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
          <div className="flex items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--line)] bg-[var(--bg-elevated)] px-3 py-2.5 backdrop-blur-xl transition focus-within:border-[rgba(0,113,227,0.35)] sm:gap-3 sm:px-4 sm:py-3">
            <input
              id="search-compuesto"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ingresa un compuesto químico"
              autoComplete="off"
              autoFocus
              className="min-w-0 flex-1 bg-transparent text-[15px] text-[var(--ink)] shadow-none outline-none ring-0 placeholder:text-[var(--ink-tertiary)] sm:text-[17px]"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-[var(--ink-secondary)] transition hover:bg-black/5 hover:text-[var(--ink)]"
                aria-label="Limpiar búsqueda"
                title="Limpiar"
              >
                <FiX size={18} aria-hidden />
              </button>
            ) : null}
            <button
              type="submit"
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-[var(--ink-tertiary)] transition hover:bg-black/5 hover:text-[var(--ink-secondary)]"
              aria-label="Buscar"
              title="Buscar"
            >
              <FiSearch size={18} aria-hidden />
            </button>
          </div>
        </form>
      </main>

      <SiteFooter />
    </div>
  )
}

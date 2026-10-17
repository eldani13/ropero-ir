import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { FiSearch, FiX } from 'react-icons/fi'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { IrSpectrumModal } from '../components/IrSpectrumModal'
import { SearchLoading } from '../components/SearchLoading'
import { SiteFooter } from '../components/SiteFooter'
import { alertError, alertInfo, alertWarning } from '../lib/alerts'
import { sdbsHitsToItems, searchSdbs, type ResultItem } from '../lib/api'

type SortKey = 'sdbs_no' | 'formula' | 'peso_molecular' | 'ir' | 'nombre'
type SortDir = 'asc' | 'desc'

type IrModalState = {
  title: string
  imageUrl: string
  sdbsNo: string | null
} | null

export function ResultsPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const q = params.get('q') ?? ''
  const [items, setItems] = useState<ResultItem[]>([])
  const [meta, setMeta] = useState({ query: '', total: 0, from: 0, to: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortKey, setSortKey] = useState<SortKey>('peso_molecular')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [draft, setDraft] = useState(q)
  const [irModal, setIrModal] = useState<IrModalState>(null)

  useEffect(() => {
    setDraft(q)
  }, [q])

  useEffect(() => {
    if (!q.trim()) {
      setLoading(false)
      setItems([])
      setError(null)
      return
    }

    let alive = true
    setLoading(true)
    setError(null)
    setItems([])
    setMeta({ query: '', total: 0, from: 0, to: 0 })

    searchSdbs(q)
      .then((res) => {
        if (!alive) return
        setMeta({
          query: res.query,
          total: res.total,
          from: res.from,
          to: res.to,
        })
        const withIr = sdbsHitsToItems(res.items.filter((hit) => hit.ir))
        setItems(withIr)
        if (withIr.length === 0) {
          void alertInfo(
            'Sin resultados',
            `No hay espectros IR para “${res.query || q}”. Prueba con “Amida”, “amide” o “benzamide”.`,
          )
        }
      })
      .catch((err: Error) => {
        if (!alive) return
        setError(err.message)
        void alertError('Error de búsqueda', err.message)
      })
      .finally(() => {
        if (alive) setLoading(false)
      })

    return () => {
      alive = false
    }
  }, [q])

  const sorted = useMemo(() => {
    const copy = [...items]
    copy.sort((a, b) => {
      const av = valueFor(a, sortKey)
      const bv = valueFor(b, sortKey)
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ? 1 : -1
      return 0
    })
    return copy
  }, [items, sortKey, sortDir])

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
      return
    }
    setSortKey(key)
    setSortDir('asc')
  }

  function onSearchSubmit(e: FormEvent) {
    e.preventDefault()
    const value = draft.trim()
    if (!value) {
      void alertWarning(
        'Campo vacío',
        'Ingresa un compuesto químico para buscar.',
      )
      return
    }
    navigate(`/resultados?q=${encodeURIComponent(value)}`)
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <main className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col px-3 pt-4 pb-3 sm:px-5 sm:pt-6 sm:pb-4">
        <header className="mb-3 shrink-0 sm:mb-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <Link
                to="/"
                className="mb-2 inline-flex text-[14px] font-medium text-[var(--accent)] hover:underline"
              >
                ← Inicio
              </Link>
              <h1 className="font-display text-[22px] font-bold tracking-[0.04em] text-[var(--ink)] uppercase sm:text-[28px]">
                Resultados
              </h1>
              {!loading ? (
                <p className="mt-1 truncate text-[13px] text-[var(--ink-secondary)] sm:text-[15px]">
                  {meta.total > 0
                    ? `${meta.from}–${meta.to} de ${meta.total} hits · “${meta.query}”`
                    : `0 resultados · “${q}”`}
                </p>
              ) : (
                <p className="mt-1 truncate text-[13px] text-[var(--ink-secondary)] sm:text-[15px]">
                  “{q}”
                </p>
              )}
            </div>

            <form onSubmit={onSearchSubmit} className="w-full shrink-0 lg:max-w-md">
              <div className="flex items-center gap-2 rounded-2xl border border-[var(--line)] bg-[var(--bg-elevated)] px-2.5 py-1.5 backdrop-blur-xl sm:px-3 sm:py-2">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Ingresa un compuesto químico"
                  className="min-w-0 flex-1 bg-transparent text-[14px] shadow-none outline-none ring-0 placeholder:text-[var(--ink-tertiary)] sm:text-[15px]"
                  aria-label="Ingresa un compuesto químico"
                />
                {draft ? (
                  <button
                    type="button"
                    onClick={() => setDraft('')}
                    className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-[var(--ink-secondary)] transition hover:bg-black/5 hover:text-[var(--ink)]"
                    aria-label="Limpiar búsqueda"
                    title="Limpiar"
                  >
                    <FiX size={16} aria-hidden />
                  </button>
                ) : null}
                <button
                  type="submit"
                  className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-[var(--ink-tertiary)] transition hover:bg-black/5 hover:text-[var(--ink-secondary)]"
                  aria-label="Buscar"
                  title="Buscar"
                >
                  <FiSearch size={16} aria-hidden />
                </button>
              </div>
            </form>
          </div>
        </header>

        <section className="flex min-h-0 flex-1 flex-col">
          {loading ? <SearchLoading query={q} /> : null}

          {!loading && error ? (
            <div className="flex flex-1 items-center justify-center rounded-2xl border border-[var(--line)] bg-[var(--bg-elevated)] px-6 py-10 text-center backdrop-blur-xl">
              <div>
                <p className="text-[17px] font-medium text-[var(--ink)]">No se pudo buscar</p>
                <p className="mt-2 text-[14px] text-[var(--ink-secondary)] sm:text-[15px]">
                  Intenta de nuevo en unos segundos.
                </p>
              </div>
            </div>
          ) : null}

          {!loading && !error && sorted.length === 0 ? (
            <div className="flex flex-1 items-center justify-center rounded-2xl border border-[var(--line)] bg-[var(--bg-elevated)] px-6 py-10 text-center backdrop-blur-xl">
              <div>
                <p className="text-[17px] font-medium text-[var(--ink)]">Sin resultados</p>
                <p className="mt-2 text-[14px] text-[var(--ink-secondary)] sm:text-[15px]">
                  Prueba con “Amida”, “amide” o un nombre como “benzamide”.
                </p>
              </div>
            </div>
          ) : null}

          {!loading && sorted.length > 0 ? (
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--bg-elevated)] shadow-[var(--shadow)] backdrop-blur-xl">
              <div className="min-h-0 flex-1 overflow-auto overscroll-contain">
                <table className="w-full min-w-[640px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-[var(--line)]">
                      <Th
                        active={sortKey === 'sdbs_no'}
                        dir={sortDir}
                        onClick={() => toggleSort('sdbs_no')}
                      >
                        <span className="sm:hidden">No</span>
                        <span className="hidden sm:inline">SDBS No</span>
                      </Th>
                      <Th
                        active={sortKey === 'formula'}
                        dir={sortDir}
                        onClick={() => toggleSort('formula')}
                      >
                        <span className="sm:hidden">Formula</span>
                        <span className="hidden sm:inline">Molecular Formula</span>
                      </Th>
                      <Th
                        active={sortKey === 'peso_molecular'}
                        dir={sortDir}
                        onClick={() => toggleSort('peso_molecular')}
                      >
                        <span className="sm:hidden">Weight</span>
                        <span className="hidden sm:inline">Molecular Weight</span>
                      </Th>
                      <Th
                        active={sortKey === 'ir'}
                        dir={sortDir}
                        onClick={() => toggleSort('ir')}
                      >
                        IR
                      </Th>
                      <Th
                        active={sortKey === 'nombre'}
                        dir={sortDir}
                        onClick={() => toggleSort('nombre')}
                      >
                        <span className="sm:hidden">Name</span>
                        <span className="hidden sm:inline">Compound Name</span>
                      </Th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((row, i) => (
                      <tr
                        key={row.id}
                        className={`border-b border-[var(--line)] last:border-b-0 ${
                          i % 2 === 1 ? 'bg-black/[0.015]' : ''
                        }`}
                      >
                        <td className="px-3 py-2.5 text-[13px] font-medium text-[var(--accent)] sm:px-4 sm:py-3 sm:text-[15px]">
                          {row.detail_url && row.sdbs_no ? (
                            <a
                              href={row.detail_url}
                              target="_blank"
                              rel="noreferrer"
                              className="hover:underline"
                            >
                              {row.sdbs_no}
                            </a>
                          ) : (
                            (row.sdbs_no ?? '—')
                          )}
                        </td>
                        <td className="px-3 py-2.5 font-mono text-[12px] text-[var(--ink)] sm:px-4 sm:py-3 sm:text-[14px]">
                          {row.formula ?? '—'}
                        </td>
                        <td className="px-3 py-2.5 text-[13px] tabular-nums text-[var(--ink)] sm:px-4 sm:py-3 sm:text-[15px]">
                          {row.peso_molecular ?? '—'}
                        </td>
                        <td className="px-3 py-2.5 sm:px-4 sm:py-3">
                          <IrBadge
                            value={row.ir}
                            clickable={Boolean(row.ir && row.ir_image_url)}
                            onClick={() => {
                              if (!row.ir_image_url) return
                              setIrModal({
                                title: row.nombre,
                                imageUrl: row.ir_image_url,
                                sdbsNo: row.sdbs_no,
                              })
                            }}
                          />
                        </td>
                        <td className="max-w-[140px] truncate px-3 py-2.5 text-[13px] text-[var(--ink)] sm:max-w-none sm:px-4 sm:py-3 sm:text-[15px]">
                          {row.nombre}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </section>

        <IrSpectrumModal
          open={Boolean(irModal)}
          onClose={() => setIrModal(null)}
          title={irModal?.title ?? ''}
          imageUrl={irModal?.imageUrl ?? ''}
          sdbsNo={irModal?.sdbsNo}
        />
      </main>
      <SiteFooter compact />
    </div>
  )
}

function valueFor(item: ResultItem, key: SortKey): string | number {
  switch (key) {
    case 'sdbs_no':
      return Number(item.sdbs_no) || item.sdbs_no || ''
    case 'formula':
      return item.formula?.toLowerCase() ?? ''
    case 'peso_molecular':
      return item.peso_molecular ?? 0
    case 'ir':
      return item.ir ? 1 : 0
    case 'nombre':
      return item.nombre.toLowerCase()
  }
}

function Th({
  children,
  active,
  dir,
  onClick,
}: {
  children: ReactNode
  active: boolean
  dir: SortDir
  onClick: () => void
}) {
  return (
    <th className="sticky top-0 z-10 bg-[#fafafa]/95 px-3 py-2.5 text-[11px] font-semibold tracking-wide text-[var(--ink-secondary)] uppercase backdrop-blur-md sm:px-4 sm:py-3 sm:text-[12px]">
      <button
        type="button"
        onClick={onClick}
        className={`inline-flex items-center gap-1 transition hover:text-[var(--ink)] ${
          active ? 'text-[var(--ink)]' : ''
        }`}
      >
        {children}
        {active ? <span aria-hidden>{dir === 'asc' ? '↑' : '↓'}</span> : null}
      </button>
    </th>
  )
}

function IrBadge({
  value,
  clickable,
  onClick,
}: {
  value: boolean
  clickable?: boolean
  onClick?: () => void
}) {
  const className = `inline-flex min-w-7 justify-center rounded-md px-2 py-0.5 text-[12px] font-semibold ${
    value
      ? 'bg-[rgba(29,131,72,0.12)] text-[var(--success)]'
      : 'bg-black/5 text-[var(--ink-tertiary)]'
  } ${clickable ? 'cursor-pointer transition hover:brightness-95 hover:ring-2 hover:ring-[rgba(29,131,72,0.25)]' : ''}`

  if (clickable) {
    return (
      <button
        type="button"
        className={className}
        onClick={onClick}
        title="Ver espectro IR"
        aria-label="Ver espectro IR"
      >
        Y
      </button>
    )
  }

  return <span className={className}>{value ? 'Y' : 'N'}</span>
}

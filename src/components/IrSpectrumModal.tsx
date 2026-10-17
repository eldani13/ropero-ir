import { useEffect } from 'react'

type Props = {
  open: boolean
  onClose: () => void
  title: string
  imageUrl: string
  sdbsNo?: string | null
}

export function IrSpectrumModal({
  open,
  onClose,
  title,
  imageUrl,
  sdbsNo,
}: Props) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Espectro IR de ${title}`}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        aria-label="Cerrar"
        onClick={onClose}
      />

      <div className="relative z-10 flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-[var(--line)] bg-white shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
        <header className="flex items-start justify-between gap-4 border-b border-[var(--line)] px-5 py-4">
          <div>
            <p className="text-[12px] font-medium tracking-wide text-[var(--ink-tertiary)] uppercase">
              Espectro IR
            </p>
            <h2 className="mt-1 text-[18px] font-semibold tracking-[-0.02em] text-[var(--ink)]">
              {title}
            </h2>
            {sdbsNo ? (
              <p className="mt-0.5 text-[13px] text-[var(--ink-secondary)]">
                SDBS No {sdbsNo}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-black/5 px-3 py-1.5 text-[13px] font-medium text-[var(--ink-secondary)] transition hover:bg-black/10"
          >
            Cerrar
          </button>
        </header>

        <div className="flex flex-1 items-center justify-center overflow-auto bg-[#fafafa] p-4">
          <img
            src={imageUrl}
            alt={`Espectro IR — ${title}`}
            className="max-h-[70vh] w-auto max-w-full rounded-lg bg-white shadow-sm"
          />
        </div>

      </div>
    </div>
  )
}

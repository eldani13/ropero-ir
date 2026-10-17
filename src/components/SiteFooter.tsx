type Props = {
  compact?: boolean
}

export function SiteFooter({ compact = false }: Props) {
  const year = new Date().getFullYear()

  return (
    <footer
      className={`shrink-0 border-t border-[var(--line)] px-4 ${
        compact ? 'py-3 sm:py-4' : 'py-5 sm:py-6'
      }`}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-1.5 text-center sm:flex-row sm:gap-2 sm:text-left">
        <p className="font-display text-[12px] font-semibold tracking-[0.12em] text-[var(--ink-tertiary)] uppercase sm:text-[13px]">
          RoperoIR
        </p>
        <p className="text-[12px] text-[var(--ink-tertiary)] sm:text-[13px]">
          © {year}{' '}
          <span className="font-medium text-[var(--accent)]">
            By Joel Cantillo - María Yime
          </span>
        </p>
      </div>
    </footer>
  )
}

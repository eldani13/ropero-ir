type Props = {
  query?: string
}

export function SearchLoading({ query }: Props) {
  return (
    <div
      className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--bg-elevated)] shadow-[var(--shadow)] backdrop-blur-xl"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Buscando resultados"
    >
      <div className="flex shrink-0 flex-col items-center justify-center gap-3 border-b border-[var(--line)] px-4 py-6 sm:gap-4 sm:px-6 sm:py-8">
        <AppleSpinner />
        <div className="text-center">
          <p className="text-[16px] font-semibold tracking-[-0.02em] text-[var(--ink)] sm:text-[17px]">
            Buscando
          </p>
          <p className="mt-1 max-w-[28rem] px-2 text-[13px] text-[var(--ink-secondary)] sm:text-[14px]">
            {query?.trim()
              ? `Preparando resultados para “${query.trim()}”…`
              : 'Esto puede tomar unos segundos…'}
          </p>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto overscroll-contain">
        <table className="w-full min-w-[640px] border-collapse text-left">
          <thead>
            <tr className="border-b border-[var(--line)]">
              {['SDBS No', 'Molecular Formula', 'Molecular Weight', 'IR', 'Compound Name'].map(
                (label) => (
                  <th
                    key={label}
                    className="sticky top-0 z-10 bg-[#fafafa]/95 px-3 py-2.5 text-[11px] font-semibold tracking-wide text-[var(--ink-tertiary)] uppercase backdrop-blur-md sm:px-4 sm:py-3 sm:text-[12px]"
                  >
                    {label}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 10 }, (_, i) => (
              <tr key={i} className="border-b border-[var(--line)] last:border-b-0">
                <td className="px-3 py-3 sm:px-4 sm:py-3.5">
                  <Skeleton className="h-3.5 w-14" />
                </td>
                <td className="px-3 py-3 sm:px-4 sm:py-3.5">
                  <Skeleton className="h-3.5 w-20" />
                </td>
                <td className="px-3 py-3 sm:px-4 sm:py-3.5">
                  <Skeleton className="h-3.5 w-12" />
                </td>
                <td className="px-3 py-3 sm:px-4 sm:py-3.5">
                  <Skeleton className="h-5 w-7 rounded-md" />
                </td>
                <td className="px-3 py-3 sm:px-4 sm:py-3.5">
                  <Skeleton className={`h-3.5 ${i % 2 === 0 ? 'w-40' : 'w-28'}`} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`ropero-shimmer rounded-md ${className}`} />
}

function AppleSpinner() {
  return (
    <div className="ropero-spinner relative h-9 w-9" aria-hidden="true">
      {Array.from({ length: 8 }, (_, i) => (
        <span
          key={i}
          className="ropero-spinner-blade absolute top-0 left-1/2 h-[38%] w-[12%] origin-[50%_130%] rounded-full bg-[var(--ink-tertiary)]"
          style={{
            transform: `rotate(${i * 45}deg)`,
            animationDelay: `${-i * 0.1}s`,
          }}
        />
      ))}
    </div>
  )
}

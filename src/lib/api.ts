export type SdbsHit = {
  sdbs_no: string
  formula: string
  peso_molecular: number | null
  ir: boolean
  ir_fname: string | null
  ir_image_url: string | null
  nombre: string
  detail_url: string
}

export type SdbsSearchResponse = {
  query: string
  total: number
  from: number
  to: number
  items: SdbsHit[]
  source: string
}

export type ResultItem = {
  id: number
  nombre: string
  sdbs_no: string | null
  formula: string | null
  peso_molecular: number | null
  ir: boolean
  detail_url?: string
  ir_image_url?: string | null
}

/** Busca vía el proxy local `/api/sdbs/search`. */
export async function searchSdbs(
  query: string,
): Promise<SdbsSearchResponse> {
  const trimmed = query.trim()
  if (!trimmed) {
    return {
      query: '',
      total: 0,
      from: 0,
      to: 0,
      items: [],
      source: '',
    }
  }

  const res = await fetch(`/api/sdbs/search?q=${encodeURIComponent(trimmed)}`)
  const text = await res.text()
  let body: { error?: string } & Partial<SdbsSearchResponse>
  try {
    body = JSON.parse(text) as typeof body
  } catch {
    throw new Error(
      res.ok
        ? 'Respuesta inválida del servidor'
        : `Error del servidor (${res.status}). Intenta de nuevo.`,
    )
  }
  if (!res.ok) {
    throw new Error(body.error ?? `Error de búsqueda (${res.status})`)
  }
  return body as SdbsSearchResponse
}

export function sdbsHitsToItems(hits: SdbsHit[]): ResultItem[] {
  return hits.map((hit, index) => ({
    id: Number(hit.sdbs_no) || index + 1,
    nombre: hit.nombre,
    sdbs_no: hit.sdbs_no,
    formula: hit.formula,
    peso_molecular: hit.peso_molecular,
    ir: hit.ir,
    detail_url: hit.detail_url,
    ir_image_url: hit.ir_image_url,
  }))
}

import * as cheerio from 'cheerio'

const BASE = 'https://sdbs.db.aist.go.jp'
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

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

export function irImageUrl(fname: string) {
  const params = new URLSearchParams({
    FileName: fname,
    SpectralType: 'ir',
    FileType: 'Spectrl',
    Format: 'Old',
  })
  return `${BASE}/API/ImageDisplayHandler.ashx?${params.toString()}`
}

export type SdbsSearchResult = {
  query: string
  total: number
  from: number
  to: number
  items: SdbsHit[]
  source: string
}

type CookieJar = Map<string, string>

function storeCookies(jar: CookieJar, res: Response) {
  for (const line of res.headers.getSetCookie?.() ?? []) {
    const part = line.split(';')[0]
    const eq = part.indexOf('=')
    if (eq > 0) jar.set(part.slice(0, eq), part.slice(eq + 1))
  }
}

function cookieHeader(jar: CookieJar) {
  return [...jar.entries()].map(([k, v]) => `${k}=${v}`).join('; ')
}

function absoluteUrl(path: string) {
  if (path.startsWith('http')) return path
  return `${BASE}${path.startsWith('/') ? path : `/${path}`}`
}

function decodeEntities(value: string) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
}

async function sdbsGet(jar: CookieJar, path: string): Promise<{ url: string; html: string }> {
  const url = absoluteUrl(path)
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, Cookie: cookieHeader(jar) },
    redirect: 'manual',
  })
  storeCookies(jar, res)

  if ([301, 302, 303, 307, 308].includes(res.status)) {
    const loc = res.headers.get('location')
    if (!loc) throw new Error('Redirect SDBS sin Location')
    return sdbsGet(jar, loc)
  }

  return { url: res.url || url, html: await res.text() }
}

async function sdbsPost(
  jar: CookieJar,
  path: string,
  body: URLSearchParams,
): Promise<{ url: string; html: string }> {
  const url = absoluteUrl(path)
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'User-Agent': UA,
      Cookie: cookieHeader(jar),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
    redirect: 'manual',
  })
  storeCookies(jar, res)

  if ([301, 302, 303, 307, 308].includes(res.status)) {
    const loc = res.headers.get('location')
    if (!loc) throw new Error('Redirect SDBS sin Location')
    // Tras POST, ASP.NET suele continuar con GET.
    return sdbsGet(jar, loc)
  }

  return { url: res.url || url, html: await res.text() }
}

function hiddenFields(html: string): URLSearchParams {
  const params = new URLSearchParams()

  for (const m of html.matchAll(/<input[^>]*type="hidden"[^>]*>/gi)) {
    const tag = m[0]
    const name = tag.match(/name="([^"]+)"/)?.[1]
    const value = tag.match(/value="([^"]*)"/)?.[1] ?? ''
    if (name) params.set(name, decodeEntities(value))
  }

  for (const m of html.matchAll(
    /<select[^>]*name="([^"]+)"[^>]*>([\s\S]*?)<\/select>/gi,
  )) {
    const name = m[1]
    const body = m[2]
    const selected =
      body.match(/<option[^>]*selected[^>]*value="([^"]*)"/i) ??
      body.match(/<option[^>]*value="([^"]*)"/i)
    if (selected) params.set(name, decodeEntities(selected[1]))
  }

  for (const m of html.matchAll(/<input[^>]*type="text"[^>]*>/gi)) {
    const tag = m[0]
    const name = tag.match(/name="([^"]+)"/)?.[1]
    const value = tag.match(/value="([^"]*)"/)?.[1] ?? ''
    if (name) params.set(name, decodeEntities(value))
  }

  return params
}

function syncHeaderFields(params: URLSearchParams, query: string) {
  const body = (key: string) =>
    params.get(`ctl00$BodyContentPlaceHolder$INP_${key}`) ?? ''

  params.set('ctl00$BodyContentPlaceHolder$INP_companame', query)
  params.set('ctl00$CtlMasterHeader$companame', query)
  params.set('ctl00$CtlMasterHeader$jsearch_opt', 'false')
  params.set('ctl00$CtlMasterHeader$formula', body('formula'))
  params.set('ctl00$CtlMasterHeader$mw_from', body('mw_from'))
  params.set('ctl00$CtlMasterHeader$mw_to', body('mw_to'))
  params.set('ctl00$CtlMasterHeader$sdbsno', body('sdbsno'))

  for (const key of [
    'c',
    'h',
    'n',
    'o',
    'f',
    'cl',
    'br',
    'i',
    's',
    'p',
    'si',
  ] as const) {
    params.set(
      `ctl00$CtlMasterHeader$${key}_from`,
      body(`${key}_from`),
    )
    params.set(`ctl00$CtlMasterHeader$${key}_to`, body(`${key}_to`))
  }

  params.set('ctl00$CtlMasterHeader$ir_Value_st', body('ir_Value_st'))
  params.set('ctl00$CtlMasterHeader$ir_range', body('ir_range') || '10')
  params.set(
    'ctl00$CtlMasterHeader$ir_trans_st',
    body('ir_trans_st') || '80',
  )
  params.set('ctl00$CtlMasterHeader$cnmr_Value_st', body('cnmr_Value_st'))
  params.set(
    'ctl00$CtlMasterHeader$cnmr_range',
    body('cnmr_range') || '2.0',
  )
  params.set('ctl00$CtlMasterHeader$cnmr_not_st', body('cnmr_not_st'))
  params.set('ctl00$CtlMasterHeader$hnmr_Value_st', body('hnmr_Value_st'))
  params.set(
    'ctl00$CtlMasterHeader$hnmr_range',
    body('hnmr_range') || '0.2',
  )
  params.set('ctl00$CtlMasterHeader$hnmr_not_st', body('hnmr_not_st'))
  params.set(
    'ctl00$CtlMasterHeader$match_type',
    params.get('ctl00$BodyContentPlaceHolder$INP_match_type') ?? '1',
  )
  params.set('ctl00$CtlMasterHeader$massno_st', body('massno_st'))
  params.set(
    'ctl00$CtlMasterHeader$page_list',
    params.get('ctl00$BodyContentPlaceHolder$INP_page_list') ?? '20',
  )
  params.set(
    'ctl00$CtlMasterHeader$order_opt',
    params.get('ctl00$BodyContentPlaceHolder$INP_order_opt') ?? '1',
  )
  params.set(
    'ctl00$CtlMasterHeader$order_desc',
    params.get('ctl00$BodyContentPlaceHolder$INP_order_desc') ?? '0',
  )
  params.set('ctl00$CtlMasterHeader$result_type', 'false')
  // Solo compuestos con espectro IR (equivale a marcar IRCheck en SDBS).
  params.set('ctl00$BodyContentPlaceHolder$IRCheck', 'on')
  params.set('ctl00$CtlMasterHeader$spectrum', '2,')
  params.set('ctl00$CtlMasterHeader$cur_page', '1')
  params.set('ctl00$BodyContentPlaceHolder$SearchButton', 'Search')
}

function parseHits(html: string): Omit<SdbsSearchResult, 'query' | 'source'> {
  const $ = cheerio.load(html)
  const text = $('body').text().replace(/\s+/g, ' ')
  const hitsMatch = text.match(/(\d+)\s*-\s*(\d+)\s*out of\s*(\d+)\s*hits/i)
  const from = hitsMatch ? Number(hitsMatch[1]) : 0
  const to = hitsMatch ? Number(hitsMatch[2]) : 0
  const total = hitsMatch ? Number(hitsMatch[3]) : 0

  const items: SdbsHit[] = []
  $('tr').each((_, tr) => {
    const tds = $(tr).find('td')
    if (tds.length < 10) return

    const cells = tds
      .map((__, td) => $(td).text().replace(/\s+/g, ' ').trim())
      .get()
    if (!/^\d+$/.test(cells[0])) return

    const sdbs_no = cells[0]
    const mw = Number.parseFloat(cells[2])
    const irHtml = tds.eq(6).html() ?? ''
    const irText = cells[6]?.toUpperCase() === 'Y'
    const fnameMatch = irHtml.match(/fname=([A-Za-z0-9_-]+)/i)
    const ir_fname = fnameMatch?.[1] ?? null

    items.push({
      sdbs_no,
      formula: cells[1],
      peso_molecular: Number.isFinite(mw) ? mw : null,
      ir: irText,
      ir_fname,
      ir_image_url: ir_fname ? irImageUrl(ir_fname) : null,
      nombre: cells[9],
      detail_url: `${BASE}/sdbs/cgi-bin/direct_frame_top.cgi?sdbsno=${sdbs_no}`,
    })
  })

  // Seguridad: nunca devolver filas sin IR (N).
  const onlyIr = items.filter((item) => item.ir)
  return {
    from: onlyIr.length ? from : 0,
    to: onlyIr.length ? Math.min(to, from + onlyIr.length - 1) : 0,
    total: total || onlyIr.length,
    items: onlyIr,
  }
}

/** Traduce tipos locales (es) a keywords SDBS (en). */
export function toSdbsQuery(input: string): string {
  const q = input.trim()
  const map: Record<string, string> = {
    amida: 'amide',
    amidas: 'amide',
    cetona: 'ketone',
    cetonas: 'ketone',
    ester: 'ester',
    éster: 'ester',
    esteres: 'ester',
    ésteres: 'ester',
    alcohol: 'alcohol',
    alcoholes: 'alcohol',
    acido: 'acid',
    ácido: 'acid',
    acidos: 'acid',
    ácidos: 'acid',
  }
  return map[q.toLowerCase()] ?? q
}

export async function searchSdbs(
  rawQuery: string,
): Promise<SdbsSearchResult> {
  const query = toSdbsQuery(rawQuery)
  if (!query) {
    return {
      query: '',
      total: 0,
      from: 0,
      to: 0,
      items: [],
      source: BASE,
    }
  }

  const jar: CookieJar = new Map()

  // 1) Disclaimer
  const disclaimer = await sdbsGet(jar, '/SearchInformation.aspx')
  const agree = hiddenFields(disclaimer.html)
  agree.set(
    'ctl00$BodyContentPlaceHolder$DisclaimeraAccept',
    'I agree the disclaimer and use SDBS.',
  )
  const searchPage = await sdbsPost(jar, '/Disclaimer.aspx', agree)

  if (!searchPage.html.includes('INP_companame')) {
    throw new Error('No se pudo abrir el formulario de búsqueda SDBS.')
  }

  // 2) Search
  const form = hiddenFields(searchPage.html)
  syncHeaderFields(form, query)
  const result = await sdbsPost(jar, '/SearchInformation.aspx', form)

  if (
    result.html.includes('Please Input the Search Word') ||
    result.html.includes('NoKeywordError')
  ) {
    throw new Error('SDBS rechazó la búsqueda (falta keyword).')
  }

  const parsed = parseHits(result.html)
  return {
    query,
    ...parsed,
    source: 'https://sdbs.db.aist.go.jp/SearchInformation.aspx',
  }
}

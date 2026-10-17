import type { VercelRequest, VercelResponse } from '@vercel/node'
import { searchSdbs } from '../../lib/sdbsClient'

// Hobby plan: máximo 10s
export const config = {
  maxDuration: 10,
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  res.setHeader('Content-Type', 'application/json')

  try {
    if (req.method !== 'GET') {
      res.status(405).json({ error: 'Método no permitido' })
      return
    }

    const q = String(req.query.q ?? '').trim()
    if (!q) {
      res.status(400).json({ error: 'Falta el parámetro q' })
      return
    }

    const data = await searchSdbs(q)
    res.status(200).json(data)
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Error consultando datos'
    console.error('[api/sdbs/search]', message, err)
    res.status(502).json({ error: message })
  }
}

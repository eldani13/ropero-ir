import type { Plugin } from 'vite'
import { searchSdbs } from '../lib/sdbsClient.ts'

export function sdbsPlugin(): Plugin {
  return {
    name: 'sdbs-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/sdbs/search')) {
          next()
          return
        }

        try {
          const url = new URL(req.url, 'http://localhost')
          const q = url.searchParams.get('q')?.trim() ?? ''
          if (!q) {
            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Falta el parámetro q' }))
            return
          }

          const data = await searchSdbs(q)
          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(data))
        } catch (err) {
          const message =
            err instanceof Error ? err.message : 'Error consultando SDBS'
          res.statusCode = 502
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: message }))
        }
      })
    },
  }
}

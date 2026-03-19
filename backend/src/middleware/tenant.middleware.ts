
import type { NextFunction, Request, Response } from 'express'
import { pool } from '../config/database.js'

function extractSubdomain(hostname: string): string | null {
  const host = hostname.split(':')[0] ?? ''
  const parts = host.split('.').filter(Boolean)

  if (parts.length < 2) return null
  return parts[0] ?? null
}

export async function tenantMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const headerCompanyId = req.header('x-company-id')
    if (headerCompanyId) {
      const empresa_id = Number(headerCompanyId)
      if (Number.isFinite(empresa_id) && empresa_id > 0) {
        res.locals.empresa_id = empresa_id
        next()
        return
      }
    }

    const subdomain = extractSubdomain(req.hostname)
    if (!subdomain) {
      const host = req.hostname.split(':')[0] ?? ''
      if (host === 'localhost' || host === '127.0.0.1') {
        res.locals.empresa_id = 1
        next()
        return
      }

      res.status(400).json({ message: 'Empresa no especificada (subdominio requerido)' })
      return
    }

    const [rows] = await pool.query(
      'SELECT id FROM empresas WHERE subdomain = ? AND estado = \'activa\' AND bloqueada = 0 LIMIT 1',
      [subdomain],
    )

    const row = (rows as Array<{ id: number }>)[0]
    if (!row) {
      res.status(404).json({ message: 'Empresa no encontrada' })
      return
    }

    res.locals.empresa_id = row.id
    next()
  } catch (err) {
    console.error('tenantMiddleware error:', err)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
}

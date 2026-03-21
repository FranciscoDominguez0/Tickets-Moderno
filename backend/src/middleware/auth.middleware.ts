import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import type { JwtPayload } from '../modules/auth/auth.types.js'

export async function requireAuth(
  req:  Request,
  res:  Response,
  next: NextFunction
): Promise<void> {
  try {
    // 1. Leer el header Authorization
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Token requerido' })
      return
    }

    // 2. Extraer el token — quita el "Bearer " del inicio
    const token = authHeader.slice(7)

    // 3. Verificar y decodificar el token
    const payload = jwt.verify(token, env.jwtSecret) as JwtPayload

    // 4. Guardar el payload en res.locals para que lo usen los controllers
    res.locals.auth = payload

    next()
  } catch (err) {
    // jwt.verify lanza errores específicos que podemos distinguir
    if (err instanceof jwt.TokenExpiredError) {
      res.status(401).json({ message: 'Token expirado' })
      return
    }
    if (err instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ message: 'Token inválido' })
      return
    }

    console.error('requireAuth error:', err)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
}

// ── Middlewares de rol ───────────────────────────────────────
// Se usan DESPUÉS de requireAuth, nunca solos

export function requireUser(req: Request, res: Response, next: NextFunction): void {
  const auth = res.locals.auth as JwtPayload

  if (auth.type !== 'user') {
    res.status(403).json({ message: 'Acceso solo para usuarios' })
    return
  }

  next()
}

export function requireStaff(req: Request, res: Response, next: NextFunction): void {
  const auth = res.locals.auth as JwtPayload

  if (auth.type !== 'staff') {
    res.status(403).json({ message: 'Acceso solo para agentes' })
    return
  }

  next()
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const auth = res.locals.auth as JwtPayload

  if (auth.type !== 'staff' || auth.role !== 'admin') {
    res.status(403).json({ message: 'Acceso solo para administradores' })
    return
  }

  next()
}

export function requireSuperadmin(req: Request, res: Response, next: NextFunction): void {
  const auth = res.locals.auth as JwtPayload

  if (auth.role !== 'superadmin') {
    res.status(403).json({ message: 'Acceso solo para superadmin' })
    return
  }

  next()
}
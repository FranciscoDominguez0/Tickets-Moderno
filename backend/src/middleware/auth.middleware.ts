import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import type { JwtPayload } from '../modules/auth/auth.types.js'

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Token requerido' })
      return
    }

    const token = authHeader.slice(7)

    const payload = jwt.verify(token, env.jwtSecret) as JwtPayload

    res.locals.auth = payload

    next()
  } catch (err) {
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
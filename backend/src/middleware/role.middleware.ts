import type { NextFunction, Request, Response } from 'express'
import type { JwtPayload } from '../modules/auth/auth.types.js'


export function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const auth = res.locals.auth as JwtPayload

    if (!auth) {
      res.status(401).json({ message: 'No autenticado' })
      return
    }

    if (!allowedRoles.includes(auth.role)) {
      res.status(403).json({ message: 'No autorizado' })
      return
    }

    next()
  }
}
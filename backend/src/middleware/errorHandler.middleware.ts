import type { NextFunction, Request, Response } from 'express'

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // Error de CORS — lo lanza corsOptions.origin()
  if (err.message.startsWith('CORS bloqueado')) {
    res.status(403).json({ message: err.message })
    return
  }

  console.error('Unhandled error:', err)
  res.status(500).json({ message: 'Error interno del servidor' })
}
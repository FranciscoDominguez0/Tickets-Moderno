import type { Request, Response } from 'express'
import { validateLoginBody } from './auth.validation.js'
import { loginUser } from './auth.service.js'
import { ForbiddenError, UnauthorizedError, ValidationError } from './auth.errors.js'

export async function loginUserController(req: Request, res: Response): Promise<void> {
  try {
    const dto = validateLoginBody(req.body)
    const empresa_id = Number(res.locals.empresa_id)
    const result = await loginUser({ ...dto, empresa_id })
    res.json(result)
  } catch (err) {
    if (err instanceof ValidationError) {
      res.status(400).json({ message: err.message })
      return
    }
    if (err instanceof UnauthorizedError) {
      res.status(401).json({ message: err.message })
      return
    }
    if (err instanceof ForbiddenError) {
      res.status(403).json({ message: err.message })
      return
    }

    console.error('loginUserController error:', err)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
}

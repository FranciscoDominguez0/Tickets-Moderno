import type { Request, Response } from 'express'
import { validateLoginBody, validateRegisterBody } from './auth.validation.js'
import { loginStaff, loginUser, registerUser } from './auth.service.js'
import { ConflictError, ForbiddenError, UnauthorizedError, ValidationError } from './auth.errors.js'
import type { JwtPayload } from './auth.types.js'

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

export async function registerUserController(req: Request, res: Response): Promise<void> {
  try {
    const dto = validateRegisterBody(req.body)
    const empresa_id = Number(res.locals.empresa_id)
    const result = await registerUser({ ...dto, empresa_id })
    res.status(201).json(result)
  } catch (err) {
    if (err instanceof ValidationError) {
      res.status(400).json({ message: err.message })
      return
    }
    if (err instanceof ConflictError) {
      res.status(409).json({ message: err.message })
      return
    }

    console.error('registerUserController error:', err)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
}

export async function loginStaffController(req: Request, res: Response): Promise<void> {
  try {
    const dto        = validateLoginBody(req.body)   // mismo validador que loginUser
    const empresa_id = Number(res.locals.empresa_id)
    const result     = await loginStaff({ ...dto, empresa_id })
    res.json(result)
  } catch (err) {
    if (err instanceof ValidationError)   { res.status(400).json({ message: err.message }); return }
    if (err instanceof UnauthorizedError) { res.status(401).json({ message: err.message }); return }
    if (err instanceof ForbiddenError)    { res.status(403).json({ message: err.message }); return }

    console.error('loginStaffController error:', err)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
}

export async function getMeController(req: Request, res: Response): Promise<void> {
  // El payload ya está verificado por requireAuth
  // Solo lo devuelves — sin consultar la DB porque ya tienes todo
  const auth = res.locals.auth as JwtPayload

  res.json({
    id:         auth.id,
    name:       auth.name,
    email:      auth.email,
    role:       auth.role,
    company_id: auth.company_id,
    type:       auth.type,
  })
}

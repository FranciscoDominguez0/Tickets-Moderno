// Controller HTTP para POST /api/auth/forgot-password.
// Recibe el email, delega al service y responde siempre 200
// sin revelar si el email existe o no en el sistema.

import type { Request, Response } from 'express'
import { validateForgotPasswordBody } from './passwordReset.validation.js'
import { forgotPassword }             from './passwordReset.service.js'
import { ValidationError }            from '../auth/auth.errors.js'

export async function forgotPasswordController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    // 1. Validar body
    const { email } = validateForgotPasswordBody(req.body)

    // 2. empresa_id viene del tenantMiddleware (ya inyectado en res.locals)
    const empresa_id = Number(res.locals.empresa_id)

    // 3. Ejecutar caso de uso
    await forgotPassword({ empresa_id, email })

    // 4. Siempre 200 — nunca revelar si el email existe
    res.json({
      message: 'Si el correo está registrado recibirás un enlace de recuperación.',
    })
  } catch (err) {
    if (err instanceof ValidationError) {
      res.status(400).json({ message: err.message })
      return
    }

    console.error('forgotPasswordController error:', err)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
}
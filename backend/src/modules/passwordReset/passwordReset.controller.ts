

import type { Request, Response } from 'express'
import { validateForgotPasswordBody, validateTokenBody } from './passwordReset.validation.js'
import { forgotPassword, resetPassword }             from './passwordReset.service.js'
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

export async function resetPasswordController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    // 1. Validar que lleguen token y newPassword con formato correcto
    const { token, newpassword } = validateTokenBody(req.body)

    // 2. empresa_id viene del tenantMiddleware — igual que en forgot-password
    const empresa_id = Number(res.locals.empresa_id)

    // 3. Ejecutar el caso de uso
    await resetPassword({
      empresa_id,
      rawToken:    token,
      newPassword: newpassword,
    })

    // 4. Respuesta de éxito — el frontend redirige al login
    res.json({
      message: 'Contraseña actualizada correctamente. Ya puedes iniciar sesión.',
    })
  } catch (err) {
    if (err instanceof ValidationError) {
      res.status(400).json({ message: err.message })
      return
    }

    console.error('resetPasswordController error:', err)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
}
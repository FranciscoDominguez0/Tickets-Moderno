// Define las rutas del módulo passwordReset.
// Se monta en /api/auth desde routes/index.ts,
// por eso el endpoint final queda en POST /api/auth/forgot-password.
// No requiere autenticación — es una ruta pública.

import { Router }                   from 'express'
import { forgotPasswordController, resetPasswordController } from './passwordReset.controller.js'

export const passwordResetRouter = Router()

passwordResetRouter.post('/forgot-password', forgotPasswordController)
passwordResetRouter.post('/reset-password',  resetPasswordController)  
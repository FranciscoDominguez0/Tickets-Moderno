import { Router } from 'express'
import { getMeController, loginStaffController, loginUserController, registerUserController } from './auth.controller.js'
import { requireAuth } from '../../middleware/auth.middleware.js'

export const authRouter = Router()


authRouter.post('/login/user', loginUserController)
authRouter.post('/login/staff', loginStaffController)
authRouter.post('/register', registerUserController)

// Rutas protegidas — requieren JWT válido
authRouter.get('/me', requireAuth, getMeController)

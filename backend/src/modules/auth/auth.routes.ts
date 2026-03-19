import { Router } from 'express'
import { loginUserController } from './auth.controller.js'

export const authRouter = Router()

authRouter.post('/login/user', loginUserController)

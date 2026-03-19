import { Router } from 'express'
import { loginUserController, registerUserController } from './auth.controller.js'

export const authRouter = Router()

authRouter.post('/login/user', loginUserController)
authRouter.post('/register', registerUserController)

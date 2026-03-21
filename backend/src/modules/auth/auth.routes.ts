import { Router } from 'express'
import { loginStaffController, loginUserController, registerUserController } from './auth.controller.js'

export const authRouter = Router()

authRouter.post('/login/user', loginUserController)
authRouter.post('/login/staff', loginStaffController)
authRouter.post('/register', registerUserController)

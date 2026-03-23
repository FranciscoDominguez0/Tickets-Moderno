import { Router }              from 'express'
import { authRouter }          from '../modules/auth/auth.routes.js'
import { passwordResetRouter } from '../modules/passwordReset/passwordReset.routes.js'
// ... resto de tus imports

export const apiRouter = Router()

// Auth — login, register, me
apiRouter.use('/auth', authRouter)

// Password reset — forgot-password, reset-password (próximamente)
apiRouter.use('/auth', passwordResetRouter)

// ... resto de tus rutas

export default apiRouter
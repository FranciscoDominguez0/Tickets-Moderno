import { Router }              from 'express'
import { authRouter }          from '../modules/auth/auth.routes.js'
import { passwordResetRouter } from '../modules/passwordReset/passwordReset.routes.js'
import { ticketAgentRouter, ticketUserRouter } from '../modules/tickets/ticket.routes.js'

export const apiRouter = Router()

// Auth — login, register, me
apiRouter.use('/auth', authRouter)

// Password reset — forgot-password, reset-password (próximamente)
apiRouter.use('/auth', passwordResetRouter)

apiRouter.use('/user', ticketUserRouter)
apiRouter.use('/staff', ticketAgentRouter)



export default apiRouter
import { Router }              from 'express'
import { authRouter }          from '../modules/auth/auth.routes.js'
import { passwordResetRouter } from '../modules/passwordReset/passwordReset.routes.js'
import { ticketAgentRouter, ticketUserRouter } from '../modules/tickets/ticket.routes.js'

export const apiRouter = Router()

// Auth — login, register, me
apiRouter.use('/auth', authRouter)

// Password reset
apiRouter.use('/auth', passwordResetRouter)

// Tickets
apiRouter.use('/user',  ticketUserRouter)   // → /api/user/tickets
apiRouter.use('/agent', ticketAgentRouter)  // → /api/agent/tickets

export default apiRouter
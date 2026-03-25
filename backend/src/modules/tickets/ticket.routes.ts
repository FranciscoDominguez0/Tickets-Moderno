import { Router }                  from 'express'
import { requireAdmin, requireAuth, requireUser } from '../../middleware/auth.middleware.js'
import { tenantMiddleware }        from '../../middleware/tenant.middleware.js'
import {getTicketsForUserController, getTicketsForAgentController }  from './ticket.controller.js'

export const ticketUserRouter = Router()

ticketUserRouter.use(tenantMiddleware)
ticketUserRouter.use(requireAuth)
ticketUserRouter.use(requireUser)

ticketUserRouter.get('/tickets', getTicketsForUserController)


export const ticketAgentRouter = Router()

ticketAgentRouter.use(tenantMiddleware)
ticketAgentRouter.use(requireAuth)
ticketAgentRouter.use(requireAdmin)
ticketAgentRouter.get('/tickets', getTicketsForAgentController)
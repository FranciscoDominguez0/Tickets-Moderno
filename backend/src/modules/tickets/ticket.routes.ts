import { Router }                  from 'express'
import { requireAuth, requireUser } from '../../middleware/auth.middleware.js'
import { tenantMiddleware }        from '../../middleware/tenant.middleware.js'
import { getMyTicketsController, getMyTicketsSummaryController }  from './ticket.controller.js'

export const ticketUserRouter = Router()

ticketUserRouter.use(tenantMiddleware)
ticketUserRouter.use(requireAuth)
ticketUserRouter.use(requireUser)

ticketUserRouter.get('/tickets', getMyTicketsSummaryController)
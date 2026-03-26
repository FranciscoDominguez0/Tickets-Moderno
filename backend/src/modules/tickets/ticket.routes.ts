import { Router }           from 'express'
import { requireAuth }      from '../../middleware/auth.middleware.js'
import { tenantMiddleware } from '../../middleware/tenant.middleware.js'
import { requireRole }      from '../../middleware/role.middleware.js'
import { uploadAttachment } from '../../middleware/upload.middleware.js'
import {
  getTicketsForUserController,
  getTicketsForAgentController,
  createTicketController,
  createTicketByAgentController,
} from './ticket.controller.js'

// ─────────────────────────────────────────────
// Router de USUARIOS
// index.ts monta en: /user
// rutas finales:     /api/user/tickets
// ─────────────────────────────────────────────
export const ticketUserRouter = Router()

ticketUserRouter.use(tenantMiddleware, requireAuth, requireRole('user'))

ticketUserRouter.get('/tickets',  getTicketsForUserController)               // GET  /api/user/tickets
ticketUserRouter.post('/tickets', uploadAttachment, createTicketController)  // POST /api/user/tickets

// ─────────────────────────────────────────────
// Router de AGENTES / ADMIN
// index.ts monta en: /agent
// rutas finales:     /api/agent/tickets
// ─────────────────────────────────────────────
export const ticketAgentRouter = Router()

ticketAgentRouter.use(tenantMiddleware, requireAuth, requireRole('agent', 'admin', 'superadmin'))

ticketAgentRouter.get('/tickets',  getTicketsForAgentController)                    // GET  /api/agent/tickets
ticketAgentRouter.post('/tickets', uploadAttachment, createTicketByAgentController) // POST /api/agent/tickets
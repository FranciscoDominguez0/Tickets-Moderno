import type { Request, Response }  from 'express'
import {
  createTicket,
  getTicketDetailForAgent,
  getTicketDetailForUser,
  listMyTicketsSummary,
  listTicketsForAgent,
} from './ticket.service.js'
import { NotFoundError, ValidationError }       from './ticket.errors.js'
import type { JwtPayload }                      from '../auth/auth.types.js'
import {
  validateCreateTicketBody,
  validateCreateTicketByAgentBody,
} from './ticket.validation.js'

// ── GET /api/user/tickets ────────────────────────────────────
export async function getTicketsForUserController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const auth       = res.locals.auth as JwtPayload
    const empresa_id = Number(res.locals.empresa_id)

    const result = await listMyTicketsSummary({
      empresa_id,
      user_id:     auth.id,
      status_id:   req.query.status_id   ? Number(req.query.status_id)   : undefined,
      priority_id: req.query.priority_id ? Number(req.query.priority_id) : undefined,
      dept_id:     req.query.dept_id     ? Number(req.query.dept_id)     : undefined,
      search:      req.query.search      as string | undefined,
      page:        req.query.page        ? Number(req.query.page)        : 1,
      limit:       req.query.limit       ? Number(req.query.limit)       : 10,
    })

    res.json(result)
  } catch (err) {
    if (err instanceof ValidationError) {
      res.status(400).json({ message: err.message })
      return
    }
    console.error('getTicketsForUserController error:', err)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
}

// ── GET /api/agent/tickets ───────────────────────────────────
export async function getTicketsForAgentController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const empresa_id = Number(res.locals.empresa_id)

    const result = await listTicketsForAgent({
      empresa_id,
      status_id:   req.query.status_id   ? Number(req.query.status_id)   : undefined,
      priority_id: req.query.priority_id ? Number(req.query.priority_id) : undefined,
      dept_id:     req.query.dept_id     ? Number(req.query.dept_id)     : undefined,
      staff_id:    req.query.staff_id    ? Number(req.query.staff_id)    : undefined,
      unassigned:  req.query.unassigned  === 'true',
      search:      req.query.search      as string | undefined,
      page:        req.query.page        ? Number(req.query.page)        : 1,
      limit:       req.query.limit       ? Number(req.query.limit)       : 10,
    })

    res.json(result)
  } catch (err) {
    if (err instanceof ValidationError) {
      res.status(400).json({ message: err.message })
      return
    }
    console.error('getTicketsForAgentController error:', err)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
}

// ── POST /api/user/tickets ───────────────────────────────────
// usuario crea su propio ticket
export async function createTicketController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const auth       = res.locals.auth as JwtPayload
    const empresa_id = Number(res.locals.empresa_id)

    const dto  = validateCreateTicketBody(req.body)
    const file = req.file ?? undefined
    const ip   = req.ip ?? req.socket.remoteAddress ?? null

    const result = await createTicket({
      dto,
      empresa_id,
      auth_user_id:    auth.id,   // ← dueño = el mismo usuario
      target_user_id:  undefined, // ← no aplica para usuario
      ip_address:      ip,
      file,
    })

    res.status(201).json(result)
  } catch (err) {
    if (err instanceof ValidationError) {
      res.status(400).json({ message: err.message })
      return
    }
    if (err instanceof NotFoundError) {
      res.status(404).json({ message: err.message })
      return
    }
    console.error('createTicketController error:', err)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
}

// ── POST /api/agent/tickets ──────────────────────────────────
// agente crea ticket en nombre de un usuario existente
export async function createTicketByAgentController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const auth       = res.locals.auth as JwtPayload
    const empresa_id = Number(res.locals.empresa_id)

    // valida igual que usuario + user_id obligatorio en body
    const dto  = validateCreateTicketByAgentBody(req.body)
    const file = req.file ?? undefined
    const ip   = req.ip ?? req.socket.remoteAddress ?? null

    const result = await createTicket({
      dto,
      empresa_id,
      auth_user_id:   auth.id,      // ← quien hace la acción (el agente)
      target_user_id: dto.user_id,  // ← dueño real del ticket
      ip_address:     ip,
      file,
    })

    res.status(201).json(result)
  } catch (err) {
    if (err instanceof ValidationError) {
      res.status(400).json({ message: err.message })
      return
    }
    if (err instanceof NotFoundError) {
      res.status(404).json({ message: err.message })
      return
    }
    console.error('createTicketByAgentController error:', err)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
}

// ── GET /api/user/tickets/:id ────────────────────────────────
export async function getTicketDetailForUserController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const auth       = res.locals.auth as JwtPayload
    const empresa_id = Number(res.locals.empresa_id)
    const ticket_id  = Number(req.params.id)

    if (!ticket_id || isNaN(ticket_id)) {
      res.status(400).json({ message: 'ID de ticket inválido' })
      return
    }

    const result = await getTicketDetailForUser({
      ticket_id,
      empresa_id,
      user_id: auth.id,  // ← siempre pasa su propio id
    })

    res.json(result)
  } catch (err) {
    if (err instanceof NotFoundError)   { res.status(404).json({ message: err.message }); return }
    if (err instanceof ValidationError) { res.status(400).json({ message: err.message }); return }
    console.error('getTicketDetailForUserController error:', err)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
}

// ── GET /api/agent/tickets/:id ───────────────────────────────
export async function getTicketDetailForAgentController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const empresa_id = Number(res.locals.empresa_id)
    const ticket_id  = Number(req.params.id)

    if (!ticket_id || isNaN(ticket_id)) {
      res.status(400).json({ message: 'ID de ticket inválido' })
      return
    }

    const result = await getTicketDetailForAgent({ ticket_id, empresa_id })

    res.json(result)
  } catch (err) {
    if (err instanceof NotFoundError)   { res.status(404).json({ message: err.message }); return }
    if (err instanceof ValidationError) { res.status(400).json({ message: err.message }); return }
    console.error('getTicketDetailForAgentController error:', err)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
}
import type { Request, Response }  from 'express'
import {listMyTicketsSummary, listTicketsForAgent }           from './ticket.service.js'
import { ValidationError }         from './ticket.errors.js'
import type { JwtPayload }         from '../auth/auth.types.js'


export async function getTicketsForUserController(req: Request, res: Response): Promise <void>{
  try{
    const auth       = res.locals.auth as JwtPayload
    const empresa_id = Number(res.locals.empresa_id)

    const result = await listMyTicketsSummary({
      empresa_id,
      user_id: auth.id,
      status_id:  req.query.status_id      ? Number(req.query.status_id) : undefined,
      priority_id: req.query.priority_id   ? Number(req.query.status_id) : undefined,
      dept_id: req.query.dept_id           ? Number(req.query.status_id) : undefined,
      search: req.query.search             as string | undefined,

    })
    res.json(result)
  }catch(err){
    if(err instanceof ValidationError){
      res.status(400).json({ menssage: err.message })
      return
    }

    console.error('getTicketsForUserController error: ', err)
    res.status(500).json({ message: 'Error interno del servidor'})

  }
}

export async function getTicketsForAgentController(req: Request, res: Response): Promise<void> {
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
      res.status(400).json({ message: err.message });
       return 
      }
    console.error('getTicketsForAgentController error:', err)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
}
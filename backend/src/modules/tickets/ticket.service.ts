import { findTicketsByUser, countTicketsByUser } from './ticket.repository.js'
import { parsePagination, buildPaginatedResult } from '../../utils/pagination.js'
import type { PaginatedResult }                  from '../../utils/pagination.js'
import type { Ticket, ListTicketsQuery }          from './ticket.types.js'
import { ValidationError }                        from './ticket.errors.js'

interface ListMyTicketsParams extends ListTicketsQuery {
  empresa_id: number
  user_id:    number
}

export async function listMyTickets(params: ListMyTicketsParams): Promise<PaginatedResult<Ticket>> {
  // Validar que los IDs numéricos sean positivos si vienen
  if (params.status_id   !== undefined && (isNaN(params.status_id)   || params.status_id   < 1))
    throw new ValidationError('status_id inválido')

  if (params.priority_id !== undefined && (isNaN(params.priority_id) || params.priority_id < 1))
    throw new ValidationError('priority_id inválido')

  if (params.dept_id     !== undefined && (isNaN(params.dept_id)     || params.dept_id     < 1))
    throw new ValidationError('dept_id inválido')

  const { page, limit, offset } = parsePagination(params)

  const filters = {
    empresa_id:   params.empresa_id,
    user_id:      params.user_id,
    status_id:    params.status_id,
    priority_id:  params.priority_id,
    dept_id:      params.dept_id,
    search:       params.search?.trim() || undefined,
  }

  const [data, total] = await Promise.all([
    findTicketsByUser({ ...filters, limit, offset }),
    countTicketsByUser(filters),
  ])

  return buildPaginatedResult(data, total, page, limit)
}
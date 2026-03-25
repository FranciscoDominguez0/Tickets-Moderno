import {
  findTicketsByUser,
  countTicketsByUser,
  findTicketsSummaryByUser,
  findTicketsForAgent,
  countTicketsForAgent,
} from './ticket.repository.js'
import { parsePagination, buildPaginatedResult } from '../../utils/pagination.js'
import type { PaginatedResult }                  from '../../utils/pagination.js'
import type {
  TicketUserView,
  TicketAgentView,
  ListTicketsQuery,
  ListTicketsAgentQuery,
} from './ticket.types.js'
import { ValidationError } from './ticket.errors.js'

// ── Validación reutilizable ──────────────────────────────────

function validateNumericFilters(params: ListTicketsQuery): void {
  if (params.status_id   !== undefined && (isNaN(params.status_id)   || params.status_id   < 1))
    throw new ValidationError('status_id inválido')
  if (params.priority_id !== undefined && (isNaN(params.priority_id) || params.priority_id < 1))
    throw new ValidationError('priority_id inválido')
  if (params.dept_id     !== undefined && (isNaN(params.dept_id)     || params.dept_id     < 1))
    throw new ValidationError('dept_id inválido')
}

// ── Usuario — detalle completo ───────────────────────────────



// ── Usuario — vista resumida ─────────────────────────────────

export async function listMyTicketsSummary(
  params: ListTicketsQuery & { empresa_id: number; user_id: number }
): Promise<PaginatedResult<TicketUserView>> {
  validateNumericFilters(params)
  const { page, limit, offset } = parsePagination(params)
  const filters = { empresa_id: params.empresa_id, user_id: params.user_id,
    status_id: params.status_id, priority_id: params.priority_id,
    dept_id: params.dept_id, search: params.search?.trim() || undefined }

  const [data, total] = await Promise.all([
    findTicketsSummaryByUser({ ...filters, limit, offset }),
    countTicketsByUser(filters),   // mismo count — misma condición WHERE
  ])

  return buildPaginatedResult(data, total, page, limit)
}

// ── Agente — vista con usuario + asignación ──────────────────

export async function listTicketsForAgent(
  params: ListTicketsAgentQuery & { empresa_id: number }
): Promise<PaginatedResult<TicketAgentView>> {
  validateNumericFilters(params)

  if (params.staff_id !== undefined && (isNaN(params.staff_id) || params.staff_id < 1))
    throw new ValidationError('staff_id inválido')

  const { page, limit, offset } = parsePagination(params)
  const filters = { empresa_id: params.empresa_id,
    status_id: params.status_id, priority_id: params.priority_id,
    dept_id: params.dept_id, search: params.search?.trim() || undefined,
    staff_id: params.staff_id, unassigned: params.unassigned }

  const [data, total] = await Promise.all([
    findTicketsForAgent({ ...filters, limit, offset }),
    countTicketsForAgent(filters),
  ])

  return buildPaginatedResult(data, total, page, limit)
}
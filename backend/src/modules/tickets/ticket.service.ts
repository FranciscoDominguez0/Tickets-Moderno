import {
  countTicketsByUser,
  findTicketsSummaryByUser,
  findTicketsForAgent,
  countTicketsForAgent,
  findTopicById,
  insertTicket,
  insertThreadEntry,
  insertAttachment,
  insertThread
} from './ticket.repository.js'
import { parsePagination, buildPaginatedResult } from '../../utils/pagination.js'
import type { PaginatedResult }                  from '../../utils/pagination.js'
import type {
  TicketUserView,
  TicketAgentView,
  ListTicketsQuery,
  ListTicketsAgentQuery,
  CreateTicketDto,
  CreateTicketResult,
} from './ticket.types.js'
import { NotFoundError, ValidationError } from './ticket.errors.js'
import { generateTicketNumber } from '../../utils/ticketNumber.js'
import { hashTocken } from '../../utils/hashToken.js'

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

export async function createTicket(params: {
  dto:        CreateTicketDto
  empresa_id: number
  user_id:    number
  ip_address: string | null
  file?: Express.Multer.File
}): Promise<CreateTicketResult> {
  const { dto, empresa_id, user_id, ip_address, file } = params

  // 1. Verifica que el topic sea válido para esta empresa
  const topic = await findTopicById({ id: dto.topic_id, empresa_id })
  if (!topic) throw new NotFoundError('El tema seleccionado no existe')

  // 2. Número atómico desde la secuencia
  const ticket_number = await generateTicketNumber(empresa_id)

  // 3. Inserta el ticket
  const ticket_id = await insertTicket({
    ticket_number,
    empresa_id,
    user_id,
    dept_id:     dto.dept_id,
    topic_id:    dto.topic_id,
    priority_id: dto.priority_id ?? 2,
    subject:     dto.subject,
    source:      'web',
    ip_address,
  })

  // 4. Crea el hilo — tabla threads (1 por ticket)
  const thread_id = await insertThread({ ticket_id, empresa_id })

  // 5. subject actúa como primer mensaje del hilo
  //    user_id = quien abre, staff_id = null, is_internal = 0
  const entry_id = await insertThreadEntry({
    thread_id,
    empresa_id,
    user_id,
    staff_id:    null,
    body:        dto.subject,
    is_internal: 0,
  })

  // 6. Archivo adjunto — solo si vino uno
  if (file) {

    const hash = hashTocken(file.path)
    await insertAttachment({
      thread_entry_id:  entry_id,
      empresa_id,
      filename:         file.filename,
      original_filename: file.originalname,
      mimetype:         file.mimetype,
      size:             file.size,
      path:             file.path,
      hash,
    })
  }

  return {
    id:            ticket_id,
    ticket_number,
    subject:       dto.subject,
    topic:         topic.name,
    created_at:    new Date().toISOString(),
  }
}
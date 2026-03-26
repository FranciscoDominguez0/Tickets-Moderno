import { pool }               from '../../config/database.js'
import type { RowDataPacket } from 'mysql2'
import type {TicketUserView, TicketAgentView } from './ticket.types.js'

// ── Helper WHERE reutilizable ────────────────────────────────

interface BaseFilters {
  empresa_id:   number
  status_id?:   number
  priority_id?: number
  dept_id?:     number
  search?:      string
}

function buildBaseWhere(params: BaseFilters): { conditions: string[]; values: unknown[] } {
  const conditions: string[] = ['t.empresa_id = ?']
  const values: unknown[]    = [params.empresa_id]

  if (params.status_id)   { conditions.push('t.status_id = ?');   values.push(params.status_id) }
  if (params.priority_id) { conditions.push('t.priority_id = ?'); values.push(params.priority_id) }
  if (params.dept_id)     { conditions.push('t.dept_id = ?');     values.push(params.dept_id) }
  if (params.search)      {
    conditions.push('(t.ticket_number LIKE ? OR t.subject LIKE ?)')
    values.push(`%${params.search}%`, `%${params.search}%`)
  }

  return { conditions, values }
}

// ════════════════════════════════════════════════════════════
// USUARIO — vista completa (detalle)
// ════════════════════════════════════════════════════════════

interface FindByUserParams extends BaseFilters {
  user_id: number
  limit:   number
  offset:  number
}

type CountByUserParams = Omit<FindByUserParams, 'limit' | 'offset'>


export async function countTicketsByUser(params: CountByUserParams): Promise<number> {
  const { conditions, values } = buildBaseWhere(params)
  conditions.push('t.user_id = ?')
  values.push(params.user_id)

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS total FROM tickets t WHERE ${conditions.join(' AND ')}`,
    values,
  )

  return (rows[0] as { total: number }).total
}

// ════════════════════════════════════════════════════════════
// USUARIO — vista resumida (lista)
// ════════════════════════════════════════════════════════════

export async function findTicketsSummaryByUser(params: FindByUserParams): Promise<TicketUserView[]> {
  const { conditions, values } = buildBaseWhere(params)
  conditions.push('t.user_id = ?')
  values.push(params.user_id)
  const where = conditions.join(' AND ')

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT
       t.ticket_number, t.subject,
       ts.name AS status,
       p.name  AS priority,
       t.created_at, t.closed_at
     FROM tickets t
     INNER JOIN ticket_status ts ON ts.id = t.status_id
     INNER JOIN priorities p     ON p.id  = t.priority_id
     WHERE ${where}
     ORDER BY t.updated_at DESC
     LIMIT ? OFFSET ?`,
    [...values, params.limit, params.offset],
  )

  return rows as TicketUserView[]
}

// ════════════════════════════════════════════════════════════
// AGENTE — vista con datos de usuario + asignación
// ════════════════════════════════════════════════════════════

interface FindByAgentParams extends BaseFilters {
  staff_id?:   number   // filtrar tickets asignados a un agente específico
  unassigned?: boolean  // solo sin asignar
  limit:       number
  offset:      number
}

type CountByAgentParams = Omit<FindByAgentParams, 'limit' | 'offset'>

export async function findTicketsForAgent(params: FindByAgentParams): Promise<TicketAgentView[]> {
  const { conditions, values } = buildBaseWhere(params)

  if (params.staff_id)   { conditions.push('t.staff_id = ?');      values.push(params.staff_id) }
  if (params.unassigned) { conditions.push('t.staff_id IS NULL') }

  const where = conditions.join(' AND ')

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT
       t.id, t.ticket_number, t.subject,
       ts.name AS status,
       p.name  AS priority,
       d.name  AS department,
       ht.name AS topic,
       CONCAT(s.firstname, ' ', s.lastname) AS assigned_to,
       CONCAT(u.firstname, ' ', u.lastname) AS user_name,
       u.email AS user_email,
       t.source, t.due_at,
       t.created_at, t.updated_at
     FROM tickets t
     INNER JOIN ticket_status ts ON ts.id = t.status_id
     INNER JOIN priorities p     ON p.id  = t.priority_id
     INNER JOIN departments d    ON d.id  = t.dept_id
     INNER JOIN users u          ON u.id  = t.user_id
     LEFT  JOIN help_topics ht   ON ht.id = t.topic_id
     LEFT  JOIN staff s          ON s.id  = t.staff_id
     WHERE ${where}
     ORDER BY t.updated_at DESC
     LIMIT ? OFFSET ?`,
    [...values, params.limit, params.offset],
  )

  return rows as TicketAgentView[]
}

export async function countTicketsForAgent(params: CountByAgentParams): Promise<number> {
  const { conditions, values } = buildBaseWhere(params)

  if (params.staff_id)   { conditions.push('t.staff_id = ?');  values.push(params.staff_id) }
  if (params.unassigned) { conditions.push('t.staff_id IS NULL') }

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS total FROM tickets t WHERE ${conditions.join(' AND ')}`,
    values,
  )

  return (rows[0] as { total: number }).total
}

export async function insertTicket(params: {
  ticket_number: string
  empresa_id:    number
  user_id:       number
  dept_id:       number
  topic_id:      number
  priority_id:   number
  subject:       string
  source:        'web' | 'email' | 'api' | 'phone'
  ip_address:    string | null
}): Promise<number> {
  const [result] = await pool.query(
    `INSERT INTO tickets
       (ticket_number, empresa_id, user_id, dept_id, topic_id,
        priority_id, status_id, subject, source, ip_address,
        created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
    [
      params.ticket_number,
      params.empresa_id,
      params.user_id,
      params.dept_id,
      params.topic_id,
      params.priority_id,
      params.subject,
      params.source,
      params.ip_address,
    ],
  )

  return (result as { insertId: number }).insertId
}

/**
 * Crea el hilo — tabla threads, 1 por ticket
 * Debe insertarse antes de insertar thread_entries
 */
export async function insertThread(params: {
  ticket_id:  number
  empresa_id: number
}): Promise<number> {
  const [result] = await pool.query(
    `INSERT INTO threads (ticket_id, empresa_id, created_at)
     VALUES (?, ?, CURRENT_TIMESTAMP)`,
    [params.ticket_id, params.empresa_id],
  )

  return (result as { insertId: number }).insertId
}

/**
 * Inserta el primer mensaje del hilo.
 * - user_id:   viene del usuario cliente, staff_id = null
 * - is_internal = 0 siempre para mensajes de usuario
 */
export async function insertThreadEntry(params: {
  thread_id:   number
  empresa_id:  number
  user_id:     number | null   // null si escribe un agente
  staff_id:    number | null   // null si escribe un usuario
  body:        string
  is_internal: 0 | 1           // 0 = mensaje normal, 1 = nota interna
}): Promise<number> {
  const [result] = await pool.query(
    `INSERT INTO thread_entries
       (thread_id, empresa_id, user_id, staff_id, body, is_internal,
        is_read, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
    [
      params.thread_id,
      params.empresa_id,
      params.user_id,
      params.staff_id,
      params.body,
      params.is_internal,
    ],
  )

  return (result as { insertId: number }).insertId
}

/**
 * Inserta el archivo adjunto vinculado al thread_entry.
 * attachments no tiene ticket_id directo — solo thread_entry_id
 */
export async function insertAttachment(params: {
  thread_entry_id: number
  empresa_id:      number
  filename:        string   // nombre generado en servidor
  original_filename: string // nombre original del usuario
  mimetype:        string
  size:            number   // bytes
  path:            string
  hash?:           string   // SHA-256 opcional para deduplicación
}): Promise<void> {
  await pool.query(
    `INSERT INTO attachments
       (thread_entry_id, empresa_id, filename, original_filename,
        mimetype, size, path, hash, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
    [
      params.thread_entry_id,
      params.empresa_id,
      params.filename,
      params.original_filename,
      params.mimetype,
      params.size,
      params.path,
      params.hash ?? null,
    ],
  )
}

/**
 * Verifica que el topic exista, esté activo y pertenezca a la empresa.
 */
export async function findTopicById(params: {
  id:         number
  empresa_id: number
}): Promise<{ id: number; name: string; dept_id: number } | null> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT id, name, dept_id
     FROM help_topics
     WHERE id = ? AND empresa_id = ? AND is_active = 1
     LIMIT 1`,
    [params.id, params.empresa_id],
  )

  return (rows[0] as { id: number; name: string; dept_id: number } | undefined) ?? null
}
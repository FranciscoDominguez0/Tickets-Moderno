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
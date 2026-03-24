import { pool }                from '../../config/database.js'
import type { RowDataPacket }  from 'mysql2'
import type { Ticket }         from './ticket.types.js'

interface FindByUserParams {
  empresa_id:   number
  user_id:      number
  status_id?:   number
  priority_id?: number
  dept_id?:     number
  search?:      string
  limit:        number
  offset:       number
}

type CountParams = Omit<FindByUserParams, 'limit' | 'offset'>

// ── helpers internos ─────────────────────────────────────────

function buildWhere(params: CountParams): { where: string; values: unknown[] } {
  const conditions: string[] = ['t.empresa_id = ?', 't.user_id = ?']
  const values: unknown[]    = [params.empresa_id, params.user_id]

  if (params.status_id)   { conditions.push('t.status_id = ?');   values.push(params.status_id) }
  if (params.priority_id) { conditions.push('t.priority_id = ?'); values.push(params.priority_id) }
  if (params.dept_id)     { conditions.push('t.dept_id = ?');     values.push(params.dept_id) }
  if (params.search)      {
    conditions.push('(t.ticket_number LIKE ? OR t.subject LIKE ?)')
    values.push(`%${params.search}%`, `%${params.search}%`)
  }

  return { where: conditions.join(' AND '), values }
}

// ── queries ──────────────────────────────────────────────────

export async function findTicketsByUser(params: FindByUserParams): Promise<Ticket[]> {
  const { where, values } = buildWhere(params)

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT
       t.id, t.ticket_number, t.subject,
       t.status_id,   ts.name  AS status,
       t.priority_id, p.name   AS priority,
       t.dept_id,     d.name   AS department,
       t.topic_id,    ht.name  AS topic,
       t.staff_id,
       CONCAT(s.firstname, ' ', s.lastname) AS assigned_to,
       t.source, t.due_at, t.closed_at,
       t.created_at, t.updated_at
     FROM tickets t
     INNER JOIN ticket_status ts ON ts.id = t.status_id
     INNER JOIN priorities p     ON p.id  = t.priority_id
     INNER JOIN departments d    ON d.id  = t.dept_id
     LEFT  JOIN help_topics ht   ON ht.id = t.topic_id
     LEFT  JOIN staff s          ON s.id  = t.staff_id
     WHERE ${where}
     ORDER BY t.updated_at DESC
     LIMIT ? OFFSET ?`,
    [...values, params.limit, params.offset],
  )

  return rows as Ticket[]
}

export async function countTicketsByUser(params: CountParams): Promise<number> {
  const { where, values } = buildWhere(params)

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS total
     FROM tickets t
     WHERE ${where}`,
    values,
  )

  return (rows[0] as { total: number }).total
}
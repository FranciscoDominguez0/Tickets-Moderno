import { pool } from '../config/database.js'
import type { RowDataPacket } from 'mysql2'

interface SequenceRow {
  next:      number
  increment: number
  padding:   number
  prefix:    string
}

/**
 * Genera el siguiente número de ticket configurable por empresa.
 * Soporta prefijo dinámico (ej: TKT, FAC, ORD o vacío).
 */
export async function generateTicketNumber(empresa_id: number): Promise<string> {
  const conn = await pool.getConnection()

  try {
    await conn.beginTransaction()

    // 1. Leer y bloquear la secuencia
    const [rows] = await conn.query<RowDataPacket[]>(
      `SELECT next, increment, padding, prefix
       FROM sequences
       WHERE empresa_id = ? AND name = 'tickets'
       LIMIT 1
       FOR UPDATE`,
      [empresa_id],
    )

    const seq = rows[0] as SequenceRow | undefined

    if (!seq) {
      throw new Error(`No existe secuencia de tickets para empresa ${empresa_id}`)
    }

    const current = Number(seq.next)

    // 2. Actualizar contador
    await conn.query(
      `UPDATE sequences
       SET next       = next + increment,
           updated_at = CURRENT_TIMESTAMP
       WHERE empresa_id = ? AND name = 'tickets'`,
      [empresa_id],
    )

    await conn.commit()

    // 4. Retornar con prefijo dinámico
    return seq.prefix && seq.prefix.trim() !== ''
      ? `${seq.prefix}-${current}`
      : String(current)

  } catch (err) {
    await conn.rollback()
    throw err
  } finally {
    conn.release()
  }
}
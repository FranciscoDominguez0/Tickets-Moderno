
import { pool } from '../../config/database.js'

export interface UserAuthRow {
  id: number
  empresa_id: number
  firstname: string
  lastname: string
  email: string
  password: string
  status: 'active' | 'banned' | 'inactive'
}

export async function findUserByEmail(params: { empresa_id: number; email: string }): Promise<UserAuthRow | null> {
  const [rows] = await pool.query(
    'SELECT id, empresa_id, firstname, lastname, email, password, status FROM users WHERE empresa_id = ? AND email = ? LIMIT 1',
    [params.empresa_id, params.email],
  )

  const row = (rows as UserAuthRow[])[0]
  return row ?? null
}

export async function updateLastLogin(table: 'users' | 'staff', id: number): Promise<void> {
  if (table === 'users') {
    await pool.query('UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = ?', [id])
    return
  }

  await pool.query('UPDATE staff SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [id])
}

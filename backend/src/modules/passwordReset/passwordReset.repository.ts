import { pool } from '../../config/database.js'

// ── Interfaces ───────────────────────────────────────────────

export interface UserForResetRow {
  id:        number
  firstname: string
  email:     string
}

// ── Queries ──────────────────────────────────────────────────

/**
 * Busca un usuario activo por email dentro de una empresa.
 * Si no existe o está inactivo/baneado devuelve null.
 */
export async function findUserForReset(params: {
  empresa_id: number
  email:      string
}): Promise<UserForResetRow | null> {
  const [rows] = await pool.query(
    `SELECT id, firstname, email
     FROM users
     WHERE empresa_id = ?
       AND email      = ?
       AND status     = 'active'
     LIMIT 1`,
    [params.empresa_id, params.email],
  )

  const row = (rows as UserForResetRow[])[0]
  return row ?? null
}

/**
 * Invalida todos los tokens anteriores del usuario (marca used_at)
 * y luego inserta el nuevo token hasheado con su fecha de expiración.
 */
export async function createPasswordResetToken(params: {
  empresa_id: number
  user_id:    number
  token_hash: string
  expires_at: Date
}): Promise<void> {
  // Invalida tokens anteriores no usados del mismo usuario
  await pool.query(
    `UPDATE user_password_resets
     SET used_at = CURRENT_TIMESTAMP
     WHERE user_id   = ?
       AND empresa_id = ?
       AND used_at   IS NULL`,
    [params.user_id, params.empresa_id],
  )

  // Inserta el nuevo token
  await pool.query(
    `INSERT INTO user_password_resets
       (empresa_id, user_id, token_hash, expires_at, created_at)
     VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
    [
      params.empresa_id,
      params.user_id,
      params.token_hash,
      params.expires_at,
    ],
  )
}
import { pool } from '../../config/database.js'
import { UserForResetRow, validateTokenRow } from './passwordReset.types.js'

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

export async function findValidResetToken(params:{
  empresa_id: number
  token_hash: string
}):Promise<validateTokenRow | null>{
  const [rows] = await pool.query(
    `SELECT id, user_id, expires_at
     FROM user_password_resets
     WHERE empresa_id = ?
       AND token_hash = ?
       AND used_at    IS NULL
       AND expires_at > NOW()
     LIMIT 1`,
    [params.empresa_id, params.token_hash],
  )
  
  const row = (rows as validateTokenRow[])[0]
  return row ?? null
}

export async function updateUserPassword(params:{
  user_id: number
  empresa_id: number
  passwordHash: string
}):Promise<void> {
await pool.query(
    `UPDATE users
     SET password   = ?,
         updated_at = CURRENT_TIMESTAMP
     WHERE id         = ?
       AND empresa_id = ?`,
    [params.passwordHash, params.user_id, params.empresa_id],
  )
}

export async function markTokenAsUsed(
  token_id: number
):Promise<void> {
  await pool.query(
    `UPDATE user_password_resets
     SET used_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [token_id],
  )
}


// src/modules/auth/auth.repository.ts

import { pool } from '../../config/database.js'

// ── Interfaces ───────────────────────────────────────────────

export interface UserAuthRow {
  id:         number
  empresa_id: number
  firstname:  string
  lastname:   string
  email:      string
  password:   string
  role:       'user'
  status:     'active' | 'inactive' | 'banned'
}

export interface StaffAuthRow {
  id:         number
  empresa_id: number
  firstname:  string
  lastname:   string
  email:      string
  password:   string
  role:       'agent' | 'supervisor' | 'admin' | 'superadmin'
  is_active:  0 | 1
}

export interface SuperadminRow {
  id:        number
  firstname: string
  lastname:  string
  email:     string
  password:  string
  role:      'superadmin'
  status:    'active' | 'inactive'
  avatar:    string | null
}

// ── Users ────────────────────────────────────────────────────

export async function findUserByEmail(params: {
  empresa_id: number
  email:      string
}): Promise<UserAuthRow | null> {
  const [rows] = await pool.query(
    `SELECT id, empresa_id, firstname, lastname, email, password, status
     FROM users
     WHERE empresa_id = ? AND email = ?
     LIMIT 1`,
    [params.empresa_id, params.email],
  )

  const row = (rows as UserAuthRow[])[0]
  return row ?? null
}

export async function createUser(params: {
  empresa_id: number
  firstname:  string
  lastname:   string
  email:      string
  password:   string
}): Promise<number> {
  const [result] = await pool.query(
    `INSERT INTO users (empresa_id, firstname, lastname, email, password, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
    [params.empresa_id, params.firstname, params.lastname, params.email, params.password],
  )

  const { insertId } = result as { insertId: number }
  return insertId
}

// ── Staff ────────────────────────────────────────────────────

export async function findStaffByEmail(params: {
  empresa_id: number
  email:      string
}): Promise<StaffAuthRow | null> {
  const [rows] = await pool.query(
    `SELECT id, empresa_id, firstname, lastname, email, password, role, is_active
     FROM staff
     WHERE empresa_id = ? AND email = ?
     LIMIT 1`,
    [params.empresa_id, params.email],
  )

  const row = (rows as StaffAuthRow[])[0]
  return row ?? null
}

// ── Superadmin ───────────────────────────────────────────────

export async function findSuperadminByEmail(email: string): Promise<SuperadminRow | null> {
  const [rows] = await pool.query(
    `SELECT id, firstname, lastname, email, password, role, status, avatar
     FROM superadmins
     WHERE email = ?
     LIMIT 1`,
    [email],
  )

  const row = (rows as SuperadminRow[])[0]
  return row ?? null
}



export async function updateLastLogin(
  table: 'users' | 'staff',
  id:    number
): Promise<void> {
  await pool.query(
    `UPDATE ${table} SET last_login = CURRENT_TIMESTAMP WHERE id = ?`,
    [id],
  )
}

// Para rehidratar sesión de usuario
export async function findUserById(params: {
  id:         number
  empresa_id: number 
}): Promise<UserAuthRow | null> {
  const [rows] = await pool.query(
    `SELECT id, empresa_id, firstname, lastname, email, status
     FROM users
     WHERE id = ? AND empresa_id = ?
     LIMIT 1`,
    [params.id, params.empresa_id],
  )

  const row = (rows as UserAuthRow[])[0]
  return row ?? null
}

// Para rehidratar sesión de staff
export async function findStaffById(params: {
  id:         number
  empresa_id: number 
}): Promise<StaffAuthRow | null> {
  const [rows] = await pool.query(
    `SELECT id, empresa_id, firstname, lastname, email, role, is_active
     FROM staff
     WHERE id = ? AND empresa_id = ?
     LIMIT 1`,
    [params.id, params.empresa_id],
  )

  const row = (rows as StaffAuthRow[])[0]
  return row ?? null
}
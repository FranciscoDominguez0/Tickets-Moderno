import bcrypt from 'bcrypt'
import type { LoginDto, LoginResponse, JwtPayload, RegisterDto } from './auth.types.js'
import { createUser, findStaffByEmail, findUserByEmail, updateLastLogin } from './auth.repository.js'
import { signAuthToken } from './auth.jwt.js'
import { UnauthorizedError, ForbiddenError, ConflictError } from './auth.errors.js'
import { validateLoginBody } from './auth.validation.js'

export async function loginUser(dto: LoginDto & { empresa_id: number }): Promise<LoginResponse> {
  const row = await findUserByEmail({
    empresa_id: dto.empresa_id, email: dto.email
  })
  if (!row) throw new UnauthorizedError()

  const ok = await bcrypt.compare(dto.password, row.password)
  if (!ok) throw new UnauthorizedError()

  if (row.status !== 'active') throw new ForbiddenError('Usuario inactivo')

  const user = {
    id: row.id,
    name: `${row.firstname} ${row.lastname}`.trim(),
    email: row.email,
    role: 'user' as const,
    company_id: row.empresa_id,
    is_active: true,
  }

  const payload: JwtPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
    company_id: user.company_id,
    type: 'user',
  }

  const token = signAuthToken(payload)
  await updateLastLogin('users', user.id)

  return { token, user }
}

export async function registerUser(dto: RegisterDto & { empresa_id: number }): Promise<LoginResponse> {
  // 1. Verificar que el email no esté en uso en esta empresa
  const existing = await findUserByEmail({
    empresa_id: dto.empresa_id, email: dto.email
  })
  if (existing) throw new ConflictError()

  // 2. Hashear la contraseña — nunca guardar texto plano
  const hashedPassword = await bcrypt.hash(dto.password, 10)

  // 3. Insertar el usuario en la base de datos
  const newId = await createUser({
    empresa_id: dto.empresa_id,
    firstname:  dto.firstname,
    lastname:   dto.lastname,
    email:      dto.email,
    password:   hashedPassword,
  })

  // 4. Construir el objeto user para el response
  const user = {
    id:         newId,
    name:       `${dto.firstname} ${dto.lastname}`.trim(),
    email:      dto.email,
    role:       'user' as const,
    company_id: dto.empresa_id,
    is_active:  true,
  }

  // 5. Generar el JWT — el usuario queda logueado automáticamente
  const payload: JwtPayload = {
    id:         user.id,
    email:      user.email,
    role:       user.role,
    company_id: user.company_id,
    type:       'user',
  }

  const token = signAuthToken(payload)

  return { token, user }
}

export async function loginStaff(dto: LoginDto & { empresa_id: number }): Promise<LoginResponse> {
  const row = await findStaffByEmail({ empresa_id: dto.empresa_id, email: dto.email })
  if (!row) throw new UnauthorizedError()

  const ok = await bcrypt.compare(dto.password, row.password)
  if (!ok) throw new UnauthorizedError()

  if (row.is_active !== 1) throw new ForbiddenError('Agente inactivo o suspendido')

  const user = {
    id:         row.id,
    name:       `${row.firstname} ${row.lastname}`.trim(),
    email:      row.email,
    role:       row.role,        // viene de la DB: 'agent' | 'admin'
    company_id: row.empresa_id,
    is_active:  true,
  }

  const payload: JwtPayload = {
    id:         user.id,
    email:      user.email,
    role:       user.role,
    company_id: user.company_id,
    type:       'staff',         // ← diferencia clave vs loginUser
  }

  const token = signAuthToken(payload)
  await updateLastLogin('staff', user.id)

  return { token, user }
}

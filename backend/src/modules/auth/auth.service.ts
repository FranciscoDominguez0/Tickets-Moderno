import bcrypt from 'bcrypt'
import type { LoginDto, LoginResponse, JwtPayload } from './auth.types.js'
import { findUserByEmail, updateLastLogin } from './auth.repository.js'
import { signAuthToken } from './auth.jwt.js'
import { UnauthorizedError, ForbiddenError } from './auth.errors.js'

export async function loginUser(dto: LoginDto & { empresa_id: number }): Promise<LoginResponse> {
  const row = await findUserByEmail({ empresa_id: dto.empresa_id, email: dto.email })
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

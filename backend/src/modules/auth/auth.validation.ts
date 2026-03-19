import { ValidationError } from './auth.errors.js'

export function validateLoginBody(body: unknown): { email: string; password: string } {
  if (!body || typeof body !== 'object') {
    throw new ValidationError('Body inválido')
  }

  const { email, password } = body as Record<string, unknown>

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    throw new ValidationError('Email inválido')
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    throw new ValidationError('La contraseña debe tener al menos 6 caracteres')
  }

  return { email: email.trim().toLowerCase(), password }
}

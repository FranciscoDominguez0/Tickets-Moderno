import { ValidationError } from './auth.errors.js'
import { RegisterDto } from './auth.types.js';

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

export function validateRegisterBody(body: unknown): RegisterDto {
  if (!body || typeof body !== 'object') {
    throw new ValidationError('Body inválido')
  }

  const { first_name, last_name, email, password } = body as Record<string, unknown>

  if (!first_name || typeof first_name !== 'string' || first_name.trim().length < 2) {
    throw new ValidationError('Nombre inválido')
  }

  if (!last_name || typeof last_name !== 'string' || last_name.trim().length < 2) {
    throw new ValidationError('Apellido inválido')
  }

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    throw new ValidationError('Email inválido')
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    throw new ValidationError('La contraseña debe tener al menos 6 caracteres')
  }

  return { first_name: first_name.trim(), last_name: last_name.trim(), email: email.trim().toLowerCase(), password }
}

import { ValidationError } from './auth.errors.js'
import { RegisterDto } from './auth.types.js'

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

  const { first_name, last_name, firstname, lastname, email, password } = body as Record<string, unknown>

  const normalizedFirstname = (firstname ?? first_name) as unknown
  const normalizedLastname = (lastname ?? last_name) as unknown

  if (!normalizedFirstname || typeof normalizedFirstname !== 'string' || normalizedFirstname.trim().length < 2) {
    throw new ValidationError('Nombre inválido')
  }

  if (!normalizedLastname || typeof normalizedLastname !== 'string' || normalizedLastname.trim().length < 2) {
    throw new ValidationError('Apellido inválido')
  }

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    throw new ValidationError('Email inválido')
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    throw new ValidationError('La contraseña debe tener al menos 6 caracteres')
  }

  return {
    firstname: normalizedFirstname.trim(),
    lastname: normalizedLastname.trim(),
    email: email.trim().toLowerCase(),
    password,
  }
}

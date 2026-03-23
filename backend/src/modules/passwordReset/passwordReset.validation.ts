import { ValidationError } from '../auth/auth.errors.js'

export function validateForgotPasswordBody(body: unknown): { email: string } {
  if (!body || typeof body !== 'object') {
    throw new ValidationError('Body inválido')
  }

  const { email } = body as Record<string, unknown>

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    throw new ValidationError('Email inválido')
  }

  return { email: email.trim().toLowerCase() }
}

export function validateTokenBody(body: unknown): { token: string; newpassword: string } {
  if (!body || typeof body !== 'object') {
    throw new ValidationError('Body inválido')
  }

  const { token, newpassword } = body as Record<string, unknown>

  if (!token || typeof token !== 'string' || token.trim().length === 0) {
    throw new ValidationError('Token inválido')
  }

  if (!newpassword || typeof newpassword !== 'string' || newpassword.trim().length < 6) {
   throw new ValidationError('La contraseña debe tener al menos 6 caracteres')
  }

  return { token: token.trim(), newpassword: newpassword.trim() }
}
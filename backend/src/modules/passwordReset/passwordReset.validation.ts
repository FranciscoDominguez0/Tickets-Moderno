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
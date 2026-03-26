import { ValidationError }      from './ticket.errors.js'
import type { CreateTicketDto } from './ticket.types.js'

export function validateCreateTicketBody(body: unknown): CreateTicketDto {
  if (!body || typeof body !== 'object') {
    throw new ValidationError('Body inválido')
  }

  const { subject, topic_id, dept_id, priority_id } =
    body as Record<string, unknown>

  // subject es el asunto y el mensaje inicial — obligatorio
  if (!subject || typeof subject !== 'string' || subject.trim().length < 3) {
    throw new ValidationError('El asunto debe tener al menos 3 caracteres')
  }

  if (subject.trim().length > 255) {
    throw new ValidationError('El asunto no puede superar 255 caracteres')
  }

  // topic obligatorio — el frontend no puede enviar sin seleccionar
  if (!topic_id || isNaN(Number(topic_id)) || Number(topic_id) < 1) {
    throw new ValidationError('Debes seleccionar un tema')
  }

  if (!dept_id || isNaN(Number(dept_id)) || Number(dept_id) < 1) {
    throw new ValidationError('dept_id inválido')
  }

  return {
    subject:     subject.trim(),
    topic_id:    Number(topic_id),
    dept_id:     Number(dept_id),
    priority_id: priority_id ? Number(priority_id) : undefined,
  }
}
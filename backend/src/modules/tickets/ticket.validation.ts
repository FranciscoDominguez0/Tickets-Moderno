import { ValidationError }                        from './ticket.errors.js'
import type { CreateTicketDto, CreateTicketByAgentDto } from './ticket.types.js'

// ── Validación para usuario ──────────────────────────────────
export function validateCreateTicketBody(body: unknown): CreateTicketDto {
  if (!body || typeof body !== 'object') {
    throw new ValidationError('Body inválido')
  }

  const { subject, topic_id, dept_id, priority_id } =
    body as Record<string, unknown>

  if (!subject || typeof subject !== 'string' || subject.trim().length < 3) {
    throw new ValidationError('El asunto debe tener al menos 3 caracteres')
  }

  if (subject.trim().length > 255) {
    throw new ValidationError('El asunto no puede superar 255 caracteres')
  }

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

// ── Validación para agente — igual + user_id obligatorio ────
export function validateCreateTicketByAgentBody(body: unknown): CreateTicketByAgentDto {
  // reutiliza toda la validación base
  const base = validateCreateTicketBody(body)

  const { user_id } = body as Record<string, unknown>

  // agente debe especificar a qué usuario pertenece el ticket
  if (!user_id || isNaN(Number(user_id)) || Number(user_id) < 1) {
    throw new ValidationError('user_id es obligatorio')
  }

  return {
    ...base,
    user_id: Number(user_id),
  }
}
// ── Vista resumida para usuario (lista de mis tickets) ──────
export interface TicketUserView {
  ticket_number: string
  subject:       string
  status:        string
  priority:      string
  created_at:    string
  closed_at:     string | null
}

// ── Vista para agente (lista de tickets en cola) ─────────────
export interface TicketAgentView {
  id:            number
  ticket_number: string
  subject:       string
  status:        string
  priority:      string
  department:    string
  topic:         string | null
  assigned_to:   string | null
  user_name:     string
  user_email:    string
  source:        'web' | 'email' | 'api' | 'phone'
  due_at:        string | null
  created_at:    string
  updated_at:    string
}

// ── Filtros compartidos ──────────────────────────────────────
export interface ListTicketsQuery {
  status_id?:   number
  priority_id?: number
  dept_id?:     number
  search?:      string
  page?:        number
  limit?:       number
}

// ── Filtros extra solo para agentes ─────────────────────────
export interface ListTicketsAgentQuery extends ListTicketsQuery {
  staff_id?:   number
  unassigned?: boolean
}

// ── Crear ticket — usuario crea el suyo ─────────────────────
export interface CreateTicketDto {
  subject:      string
  topic_id:     number
  dept_id:      number
  priority_id?: number
}

// ── Crear ticket — agente crea en nombre de un usuario ──────
export interface CreateTicketByAgentDto extends CreateTicketDto {
  user_id: number   // ← agente especifica a qué usuario pertenece
}

export interface CreateTicketResult {
  id:            number
  ticket_number: string
  subject:       string
  topic:         string
  created_at:    string
}

export interface AttachmentView {
  filename: string
  mimetype: string
  size:     number  
}
export interface ThreadEntryView {
  id:          number
  body:        string
  is_internal: 0 | 1          // agente ve 0 y 1, usuario solo ve 0
  created_at:  string
  user_name:   string | null  // quien escribió si es cliente
  staff_name:  string | null  // quien escribió si es agente
  attachments: AttachmentView[]
}

// ── Cabecera del ticket (campos comunes a ambos roles) ───────
export interface TicketDetailHeader {
  ticket_number: string
  subject:       string
  status:        string
  priority:      string
  department:    string
  topic:         string | null
  assigned_to:   string | null
  source:        'web' | 'email' | 'api' | 'phone'
  ip_address:    string | null
  due_at:        string | null
  created_at:    string
  updated_at:    string
  closed_at:     string | null
  // solo visible para agentes (user lo ve como su propio ticket)
  user_name:     string
  user_email:    string
}

// ── Respuesta final: cabecera + hilo ─────────────────────────
export interface TicketDetailResult extends TicketDetailHeader {
  thread: ThreadEntryView[]
}

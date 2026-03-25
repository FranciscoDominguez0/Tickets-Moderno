// ── Vista completa (detalle de ticket) ──────────────────────
export interface Ticket {
  id:            number
  ticket_number: string
  subject:       string
  status_id:     number
  status:        string
  priority_id:   number
  priority:      string
  dept_id:       number
  department:    string
  topic_id:      number | null
  topic:         string | null
  staff_id:      number | null
  assigned_to:   string | null
  source:        'web' | 'email' | 'api' | 'phone'
  due_at:        string | null
  closed_at:     string | null
  created_at:    string
  updated_at:    string
}

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
  assigned_to:   string | null  // puede no estar asignado
  user_name:     string         // quién abrió el ticket
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
  staff_id?:    number   // filtrar por agente asignado
  unassigned?:  boolean  // solo tickets sin asignar
}
export interface Ticket {
  id:            number
  ticket_number: string
  subject:       string
  status_id:     number
  status:        string        // JOIN ticket_status.name
  priority_id:   number
  priority:      string        // JOIN priorities.name
  dept_id:       number
  department:    string        // JOIN departments.name
  topic_id:      number | null
  topic:         string | null // JOIN help_topics.name
  staff_id:      number | null
  assigned_to:   string | null // JOIN staff nombre completo
  source:        'web' | 'email' | 'api' | 'phone'
  due_at:        string | null
  closed_at:     string | null
  created_at:    string
  updated_at:    string
}

export interface ListTicketsQuery {
  status_id?:    number
  priority_id?:  number
  dept_id?:      number
  search?:       string
  page?:         number
  limit?:        number
}
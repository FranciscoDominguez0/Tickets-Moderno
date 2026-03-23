// ── Interfaces ───────────────────────────────────────────────

export interface UserForResetRow {
  id:        number
  firstname: string
  email:     string
}

export interface validateTokenRow {
  id: number
  user_id: number
}
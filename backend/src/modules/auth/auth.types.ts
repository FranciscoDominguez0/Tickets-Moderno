export interface JwtPayload {
  id: number      
  email: string    
  role: 'user' | 'agent' | 'admin' | 'superadmin'  
  company_id: number 
  type: 'user' | 'staff'  
}

export interface AuthUser {
  id: number
  name: string
  email: string
  role: 'user' | 'agent' | 'admin' | 'superadmin'
  company_id: number
  is_active: boolean
  avatar?: string | null
}

export interface LoginDto {
    email: string
    password: string
}

export interface LoginResponse {
    token: string
    user: AuthUser
}

export interface RegisterDto{
  firstname: string
  lastname: string
  email: string
  password: string
}




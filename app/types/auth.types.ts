export interface User {
  id: string | number
  email: string
  full_name: string
  email_verified: boolean
  mfa_enabled: boolean
  created_at: string
  updated_at: string
  is_demo?: boolean
}

export interface UserWithPassword extends User {
  password_hash: string
  previous_passwords: string[]
  failed_login_attempts: number
  lockout_until?: string | Date
  recovery_token?: string
  recovery_token_expires_at?: string | Date
  verification_token?: string
  mfa_secret?: string
  session_token?: string
  last_ip_address?: string
  last_login_at?: string | Date
}

export interface RefreshToken {
  id: string
  user_id: string | number
  token: string
  expires_at: Date
  is_revoked: boolean
  device_info?: string
  created_at: string
  updated_at: string
}

export interface LoginAttempt {
  id?: number
  user_id: string | number
  ip_address: string
  user_agent?: string
  location?: string
  success: boolean
  failure_reason?: string
  created_at?: string | Date
}

export interface AuthSession {
  userId: string
  email: string
  expiresAt: Date
}

export interface LoginForm {
  email: string
  password: string
  remember?: boolean
}

export interface RegisterForm {
  email: string
  password: string
  confirmPassword: string
  full_name: string
}

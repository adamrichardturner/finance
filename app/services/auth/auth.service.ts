import * as argon2 from 'argon2'
import bcrypt from 'bcryptjs'
import { randomBytes } from 'crypto'
import { createCookie } from '@remix-run/node'
import { z } from 'zod'
import * as userRepository from '~/repositories/user.repository'
import {
  LoginForm,
  RegisterForm,
  User,
  UserWithPassword,
} from '~/types/auth.types'
import { DEMO_USER_ID } from '~/repositories/user.repository'
import { compare, hash } from 'bcryptjs'

// Secure password validation schema
export const passwordSchema = z
  .string()
  .min(10, 'Password must be at least 10 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')

// Registration schema with all validations
export const registerSchema = z
  .object({
    email: z.string().email('Please enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        'Password must include uppercase, lowercase, number and special character'
      ),
    confirmPassword: z.string(),
    full_name: z.string().min(2, 'Name must be at least 2 characters'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

// Login schema
export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  remember: z.boolean().optional(),
})

// Create a secure cookie for the session
export const authCookie = createCookie('auth', {
  httpOnly: true,
  path: '/',
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  secrets: [process.env.SESSION_SECRET || 'default-dev-secret'],
})

// Create a secure cookie for refresh tokens
export const refreshTokenCookie = createCookie('refresh_token', {
  httpOnly: true,
  path: '/',
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  secrets: [process.env.SESSION_SECRET || 'default-dev-secret'],
})

// Generate a secure verification token
export function generateSecureToken(length = 32): string {
  return randomBytes(length).toString('hex')
}

// Hash a password using Argon2 (preferred) or bcrypt as fallback
export async function hashPassword(password: string): Promise<string> {
  try {
    // Argon2id is the recommended algorithm for password hashing
    return await argon2.hash(password, {
      type: argon2.argon2id, // Most secure variant
      memoryCost: 65536, // 64 MiB
      timeCost: 3, // 3 iterations
      parallelism: 4, // 4 parallel threads
      hashLength: 32, // 32 bytes output
    })
  } catch (error) {
    // Fallback to bcrypt if Argon2 fails (e.g., in environments where it's not supported)
    console.warn('Argon2 failed, falling back to bcrypt:', error)
    const salt = await bcrypt.genSalt(12) // 12 rounds is considered secure
    return bcrypt.hash(password, salt)
  }
}

// Verify a password against a hash
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  try {
    // Try Argon2 first
    if (hash.startsWith('$argon2')) {
      return await argon2.verify(hash, password)
    }

    // Fall back to bcrypt
    return await bcrypt.compare(password, hash)
  } catch (error) {
    console.error('Password verification error:', error)
    return false
  }
}

// Check if a password was previously used
export function wasPasswordPreviouslyUsed(
  password: string,
  previousPasswords: string[]
): Promise<boolean> {
  return new Promise((resolve) => {
    if (!previousPasswords.length) {
      resolve(false)
      return
    }

    // Check each hash in parallel
    Promise.all(
      previousPasswords.map((hash) => verifyPassword(password, hash))
    ).then((results) => {
      // If any verification returned true, the password was previously used
      resolve(results.some((result) => result))
    })
  })
}

// Register a new user
export async function register(formData: RegisterForm): Promise<{
  user: User | null
  error: string | null
}> {
  try {
    // Validate form data
    const validatedData = registerSchema.parse(formData)

    // Check if user already exists
    const existingUser = await userRepository.findUserByEmail(
      validatedData.email
    )

    if (existingUser) {
      return {
        user: null,
        error: 'A user with this email already exists',
      }
    }

    // Hash password
    const passwordHash = await hashPassword(validatedData.password)

    // Generate verification token
    const verificationToken = generateSecureToken()

    // Create user
    const user = await userRepository.createUser({
      email: validatedData.email,
      password_hash: passwordHash,
      full_name: validatedData.full_name,
      email_verified: false, // Requires verification
      verification_token: verificationToken,
      previous_passwords: [passwordHash], // Store current password in history
      failed_login_attempts: 0,
      mfa_enabled: false,
    })

    // TODO: Send verification email with token

    return { user, error: null }
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Extract the first validation error
      const fieldError = error.errors[0]
      return {
        user: null,
        error: fieldError.message,
      }
    }

    console.error('Registration error:', error)
    return {
      user: null,
      error: 'An unexpected error occurred during registration',
    }
  }
}

// Login a user
export async function login(
  formData: LoginForm,
  ipAddress: string,
  userAgent?: string
): Promise<{
  user: User | null
  error: string | null
}> {
  // Check for demo login
  if (formData.email.toLowerCase() === 'demo@example.com') {
    return {
      user: null,
      error: null,
    }
  }

  try {
    // Validate form data
    const validatedData = loginSchema.parse(formData)

    // Find user by email with password data
    const user = await userRepository.findUserWithPasswordByEmail(
      validatedData.email
    )

    if (!user) {
      // To prevent user enumeration, use the same error for non-existent users
      return {
        user: null,
        error: 'Invalid email or password',
      }
    }

    // Check if account is locked
    if (user.lockout_until && new Date(user.lockout_until) > new Date()) {
      await userRepository.updateLoginAttempt(user.id, false, {
        ip_address: ipAddress,
        user_agent: userAgent,
        failure_reason: 'Account locked',
      })

      return {
        user: null,
        error:
          'Your account is temporarily locked due to too many failed login attempts. Please try again later.',
      }
    }

    // Check if email is verified
    if (!user.email_verified) {
      await userRepository.updateLoginAttempt(user.id, false, {
        ip_address: ipAddress,
        user_agent: userAgent,
        failure_reason: 'Email not verified',
      })

      return {
        user: null,
        error: 'Please verify your email address before logging in',
      }
    }

    // Verify password
    const passwordValid = await verifyPassword(
      validatedData.password,
      user.password_hash
    )

    if (!passwordValid) {
      await userRepository.updateLoginAttempt(user.id, false, {
        ip_address: ipAddress,
        user_agent: userAgent,
        failure_reason: 'Invalid password',
      })

      return {
        user: null,
        error: 'Invalid email or password',
      }
    }

    // Track successful login
    await userRepository.updateLoginAttempt(user.id, true, {
      ip_address: ipAddress,
      user_agent: userAgent,
    })

    // Return user without sensitive data
    const safeUser: User = {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      email_verified: user.email_verified,
      mfa_enabled: user.mfa_enabled,
      created_at: user.created_at,
      updated_at: user.updated_at,
    }

    return { user: safeUser, error: null }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldError = error.errors[0]
      return {
        user: null,
        error: fieldError.message,
      }
    }

    console.error('Login error:', error)
    return {
      user: null,
      error: 'An unexpected error occurred during login',
    }
  }
}

// Create a refresh token for a user
export async function createUserRefreshToken(
  userId: string,
  deviceInfo?: string
): Promise<string> {
  const token = generateSecureToken(40)
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 30) // 30 days from now

  await userRepository.createRefreshToken({
    user_id: userId,
    token,
    expires_at: expiresAt,
    is_revoked: false,
    device_info: deviceInfo,
  } as any)

  return token
}

// Verify and use a refresh token
export async function useRefreshToken(token: string): Promise<User | null> {
  const refreshToken = await userRepository.findRefreshToken(token)

  if (!refreshToken) {
    return null
  }

  // Check if token is expired
  if (new Date(refreshToken.expires_at) < new Date()) {
    await userRepository.revokeRefreshToken(token)
    return null
  }

  // Get user data
  const user = await userRepository.findUserById(refreshToken.user_id)

  if (!user) {
    await userRepository.revokeRefreshToken(token)
    return null
  }

  // Revoke the used token (single-use)
  await userRepository.revokeRefreshToken(token)

  // Create a new token (token rotation for security)
  const newToken = await createUserRefreshToken(
    refreshToken.user_id,
    refreshToken.device_info
  )

  return user
}

// Logout a user by revoking all refresh tokens
export async function logoutUser(userId: string): Promise<void> {
  await userRepository.revokeAllUserRefreshTokens(userId)
}

/**
 * Authenticate a user with their credentials
 */
export async function authenticateUser(formData: LoginForm): Promise<{
  userId: string | null
  error: string | null
}> {
  // Check for demo login
  if (formData.email.toLowerCase() === 'demo@example.com') {
    return {
      userId: DEMO_USER_ID,
      error: null,
    }
  }

  try {
    // Validate form data
    loginSchema.parse(formData)

    // Find user by email
    const user = await userRepository.findUserWithPasswordByEmail(
      formData.email
    )

    if (!user) {
      return {
        userId: null,
        error: 'Invalid email or password',
      }
    }

    // Check if user is locked out
    if (user.lockout_until && new Date(user.lockout_until) > new Date()) {
      return {
        userId: null,
        error: 'Account is temporarily locked. Try again later.',
      }
    }

    // Check password
    const isValid = await compare(formData.password, user.password_hash)

    if (!isValid) {
      // Record failed login attempt
      await userRepository.updateLoginAttempt(user.id, false, {
        ip_address: 'unknown',
        failure_reason: 'Invalid password',
      })

      return {
        userId: null,
        error: 'Invalid email or password',
      }
    }

    // Record successful login
    await userRepository.updateLoginAttempt(user.id, true, {
      ip_address: 'unknown',
    })

    return {
      userId: user.id,
      error: null,
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors = error.errors[0]
      return {
        userId: null,
        error: fieldErrors.message,
      }
    }

    console.error('Authentication error:', error)
    return {
      userId: null,
      error: 'An error occurred during authentication',
    }
  }
}

/**
 * Register a new user
 */
export async function registerUser(formData: RegisterForm): Promise<{
  userId: string | null
  error: string | null
}> {
  try {
    // Validate form data
    registerSchema.parse(formData)

    // Check if email already exists
    const existingUser = await userRepository.findUserByEmail(formData.email)

    if (existingUser) {
      return {
        userId: null,
        error: 'A user with this email already exists',
      }
    }

    // Hash password
    const passwordHash = await hash(formData.password, 10)

    // Create user
    const newUser = await userRepository.createUser({
      email: formData.email,
      password_hash: passwordHash,
      full_name: formData.full_name,
      email_verified: false,
      verification_token: generateVerificationToken(),
      failed_login_attempts: 0,
      previous_passwords: [],
      mfa_enabled: false,
    })

    return {
      userId: newUser.id,
      error: null,
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors = error.errors[0]
      return {
        userId: null,
        error: fieldErrors.message,
      }
    }

    console.error('Registration error:', error)
    return {
      userId: null,
      error: 'An error occurred during registration',
    }
  }
}

/**
 * Generate a random verification token
 */
function generateVerificationToken(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  )
}

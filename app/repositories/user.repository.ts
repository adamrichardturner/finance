import db from '~/lib/db.server'
import {
  LoginAttempt,
  RefreshToken,
  User,
  UserWithPassword,
} from '~/types/auth.types'

// Import environment variables from server
import { getDemoUserEnv } from '~/utils/env.server'

const { demoUserId: DEMO_USER_ID, demoUserPasswordHash } = getDemoUserEnv()

// Create a demo user object
export const DEMO_USER: User = {
  id: DEMO_USER_ID,
  email: 'demo@example.com',
  full_name: 'Demo User',
  email_verified: true,
  mfa_enabled: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  is_demo: true,
}

// Create a demo user with password for authentication
export const DEMO_USER_WITH_PASSWORD: UserWithPassword = {
  ...DEMO_USER,
  password_hash: demoUserPasswordHash,
  previous_passwords: [],
  failed_login_attempts: 0,
  lockout_until: undefined,
  verification_token: undefined,
  recovery_token: undefined,
  recovery_token_expires_at: undefined,
  last_ip_address: undefined,
}

/**
 * Check if a given ID matches the demo user ID
 */
function isMatchingDemoUserId(id: string | number): boolean {
  if (typeof DEMO_USER_ID === 'number' && typeof id === 'string') {
    return DEMO_USER_ID === parseInt(id, 10)
  }

  if (typeof DEMO_USER_ID === 'string' && typeof id === 'number') {
    return parseInt(DEMO_USER_ID, 10) === id
  }

  return DEMO_USER_ID === id
}

export async function findUserById(id: string | number): Promise<User | null> {
  // Return the demo user if the ID matches
  if (isMatchingDemoUserId(id)) {
    return DEMO_USER
  }

  try {
    const user = await db<User>('users')
      .select(
        'id',
        'email',
        'full_name',
        'email_verified',
        'mfa_enabled',
        'created_at',
        'updated_at'
      )
      .where('id', String(id))
      .first()

    return user || null
  } catch (error) {
    console.error('Error fetching user by ID:', error)
    return null
  }
}

export async function findUserByEmail(email: string): Promise<User | null> {
  // Return the demo user if the email matches
  if (email.toLowerCase() === DEMO_USER.email.toLowerCase()) {
    return DEMO_USER
  }

  try {
    const user = await db<User>('users')
      .select(
        'id',
        'email',
        'full_name',
        'email_verified',
        'mfa_enabled',
        'created_at',
        'updated_at'
      )
      .where({ email: email.toLowerCase() })
      .first()

    return user || null
  } catch (error) {
    console.error('Error fetching user by email:', error)
    return null
  }
}

export async function findUserWithPasswordByEmail(
  email: string
): Promise<UserWithPassword | null> {
  // Return the demo user with password if the email matches
  if (email.toLowerCase() === DEMO_USER.email.toLowerCase()) {
    return DEMO_USER_WITH_PASSWORD
  }

  try {
    const user = await db<UserWithPassword>('users')
      .where({ email: email.toLowerCase() })
      .first()

    return user || null
  } catch (error) {
    console.error('Error fetching user with password by email:', error)
    return null
  }
}

export async function createUser(
  user: Omit<UserWithPassword, 'id' | 'created_at' | 'updated_at'>
): Promise<User> {
  try {
    const [newUser] = await db('users')
      .insert<User>({
        email: user.email.toLowerCase(),
        password_hash: user.password_hash,
        full_name: user.full_name,
        email_verified: user.email_verified,
        verification_token: user.verification_token,
        mfa_enabled: false,
      } as any)
      .returning([
        'id',
        'email',
        'full_name',
        'email_verified',
        'mfa_enabled',
        'created_at',
        'updated_at',
      ])

    return newUser
  } catch (error) {
    console.error('Error creating user:', error)
    throw error
  }
}

export async function updateUser(
  id: string | number,
  data: Partial<UserWithPassword>
): Promise<User> {
  // For demo user, just return the updated user without hitting the database
  if (isMatchingDemoUserId(id)) {
    // Create an updated version of the demo user
    const updatedDemoUser = {
      ...DEMO_USER,
      ...data,
      updated_at: new Date().toISOString(),
    }
    return updatedDemoUser
  }

  try {
    const [updatedUser] = await db<User>('users')
      .where('id', String(id))
      .update(data)
      .returning([
        'id',
        'email',
        'full_name',
        'email_verified',
        'mfa_enabled',
        'created_at',
        'updated_at',
      ])

    return updatedUser as User
  } catch (error) {
    console.error('Error updating user:', error)
    throw error
  }
}

export async function updateLoginAttempt(
  userId: string | number,
  success: boolean,
  data: Partial<LoginAttempt>
): Promise<void> {
  // For demo user, don't update login attempts
  if (isMatchingDemoUserId(userId)) {
    return
  }

  try {
    // Update the user's failed login attempts if the login failed
    if (!success) {
      await db.transaction(async (trx) => {
        const user = await trx<UserWithPassword>('users')
          .where('id', userId)
          .first()

        if (!user) {
          return
        }

        const failedAttempts = user.failed_login_attempts + 1
        const updates: Partial<UserWithPassword> = {
          failed_login_attempts: failedAttempts,
        }

        // Lock the account after 5 failed attempts
        if (failedAttempts >= 5) {
          const lockoutUntil = new Date()
          lockoutUntil.setMinutes(lockoutUntil.getMinutes() + 15) // 15-minute lockout
          updates.lockout_until = lockoutUntil
        }

        await trx<UserWithPassword>('users').where('id', userId).update(updates)

        // Record the login attempt
        await trx<LoginAttempt>('login_history').insert({
          user_id: userId,
          ip_address: data.ip_address,
          user_agent: data.user_agent,
          location: data.location,
          success,
          failure_reason: data.failure_reason,
        } as any)
      })

      return
    }

    // If login was successful, reset failed attempts and record the login
    await db.transaction(async (trx) => {
      await trx<UserWithPassword>('users')
        .where('id', userId)
        .update({
          failed_login_attempts: 0,
          lockout_until: null,
          last_login_at: new Date(),
          last_ip_address: data.ip_address,
        } as any)

      await trx<LoginAttempt>('login_history').insert({
        user_id: userId,
        ip_address: data.ip_address,
        user_agent: data.user_agent,
        location: data.location,
        success: true,
      } as any)
    })
  } catch (error) {
    console.error('Error updating login attempt:', error)
  }
}

export async function createRefreshToken(
  data: Omit<RefreshToken, 'id' | 'created_at' | 'updated_at'>
): Promise<RefreshToken> {
  try {
    // For demo user, return a mock refresh token
    if (data.user_id === DEMO_USER_ID) {
      return {
        id: 'demo-refresh-token',
        user_id: DEMO_USER_ID,
        token: data.token,
        expires_at: data.expires_at,
        is_revoked: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    }

    const [token] = await db<RefreshToken>('refresh_tokens')
      .insert(data)
      .returning('*')

    return token
  } catch (error) {
    console.error('Error creating refresh token:', error)
    throw error
  }
}

export async function findRefreshToken(
  token: string
): Promise<RefreshToken | null> {
  // Mock handling for demo user refresh token
  if (token.startsWith('demo-')) {
    return {
      id: 'demo-refresh-token',
      user_id: DEMO_USER_ID,
      token,
      expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days from now
      is_revoked: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  }

  try {
    const refreshToken = await db<RefreshToken>('refresh_tokens')
      .where({ token, is_revoked: false })
      .first()

    return refreshToken || null
  } catch (error) {
    console.error('Error finding refresh token:', error)
    return null
  }
}

export async function revokeRefreshToken(token: string): Promise<void> {
  // Don't need to do anything for demo tokens
  if (token.startsWith('demo-')) {
    return
  }

  try {
    await db<RefreshToken>('refresh_tokens')
      .where({ token })
      .update({ is_revoked: true })
  } catch (error) {
    console.error('Error revoking refresh token:', error)
  }
}

export async function revokeAllUserRefreshTokens(
  userId: string
): Promise<void> {
  // Don't need to do anything for demo user
  if (isMatchingDemoUserId(userId)) {
    return
  }

  try {
    await db<RefreshToken>('refresh_tokens')
      .where('user_id', userId)
      .update({ is_revoked: true })
  } catch (error) {
    console.error('Error revoking all user refresh tokens:', error)
  }
}

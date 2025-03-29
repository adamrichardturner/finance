import { createCookie } from '@remix-run/node'
import * as userRepository from '~/repositories/user.repository'
import { User } from '~/types/auth.types'

/**
 * Create a secure cookie for the session
 */
export const authCookie = createCookie('auth', {
  httpOnly: true,
  path: '/',
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  secrets: [process.env.SESSION_SECRET || 'default-dev-secret'],
})

/**
 * Create a secure cookie for refresh tokens
 */
export const refreshTokenCookie = createCookie('refresh_token', {
  httpOnly: true,
  path: '/',
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  secrets: [process.env.SESSION_SECRET || 'default-dev-secret'],
})

/**
 * Generate a secure token
 */
function generateSecureToken(length = 32): string {
  return Array.from({ length }, () =>
    Math.floor(Math.random() * 36).toString(36)
  ).join('')
}

/**
 * Create a refresh token for a user
 */
export async function createUserRefreshToken(
  userId: string | number,
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
  })

  return token
}

/**
 * Verify and use a refresh token
 */
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

  return user
}

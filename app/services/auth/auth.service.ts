import { createCookie } from '@remix-run/node'
import * as userRepository from '~/repositories/user.repository'
import { User } from '~/types/auth.types'

export const authCookie = createCookie('auth', {
  httpOnly: true,
  path: '/',
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  secrets: [process.env.SESSION_SECRET || 'default-dev-secret'],
})

export const refreshTokenCookie = createCookie('refresh_token', {
  httpOnly: true,
  path: '/',
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  secrets: [process.env.SESSION_SECRET || 'default-dev-secret'],
})

function generateSecureToken(length = 32): string {
  return Array.from({ length }, () =>
    Math.floor(Math.random() * 36).toString(36)
  ).join('')
}

export async function createUserRefreshToken(
  userId: string | number,
  deviceInfo?: string
): Promise<string> {
  const token = generateSecureToken(40)
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 30)

  await userRepository.createRefreshToken({
    user_id: userId,
    token,
    expires_at: expiresAt,
    is_revoked: false,
    device_info: deviceInfo,
  })

  return token
}

export async function useRefreshToken(token: string): Promise<User | null> {
  const refreshToken = await userRepository.findRefreshToken(token)

  if (!refreshToken) {
    return null
  }

  if (new Date(refreshToken.expires_at) < new Date()) {
    await userRepository.revokeRefreshToken(token)
    return null
  }

  const user = await userRepository.findUserById(refreshToken.user_id)

  if (!user) {
    await userRepository.revokeRefreshToken(token)
    return null
  }

  await userRepository.revokeRefreshToken(token)

  return user
}

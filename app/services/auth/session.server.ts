import { createCookieSessionStorage, redirect } from '@remix-run/node'
import { authCookie, refreshTokenCookie } from './auth.service'
import * as userRepository from '~/repositories/user.repository'
import { AuthSession, User } from '~/types/auth.types'
import { compare, hash } from 'bcryptjs'

// Create session storage
const sessionStorage = createCookieSessionStorage({
  cookie: authCookie,
})

// Get the user session from a request
export async function getUserSession(request: Request) {
  return sessionStorage.getSession(request.headers.get('Cookie'))
}

// Get the current user ID from the session
export async function getUserId(request: Request): Promise<string | null> {
  const session = await getUserSession(request)
  const userId = session.get('userId')

  if (!userId || typeof userId !== 'string') {
    return null
  }

  return userId
}

// Get the current authenticated user
export async function getUser(request: Request) {
  const userId = await getUserId(request)

  if (!userId) {
    return null
  }

  const user = await userRepository.findUserById(userId)
  return user
}

// Require a user to be authenticated
export async function requireUserId(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
) {
  const userId = await getUserId(request)

  if (!userId) {
    const searchParams = new URLSearchParams([['redirectTo', redirectTo]])
    throw redirect(`/login?${searchParams}`)
  }

  return userId
}

// Create a new session for a user
export async function createUserSession({
  request,
  userId,
  expirationSeconds = 60 * 60 * 24 * 7, // 7 days
  remember = false,
  redirectTo,
}: {
  request: Request
  userId: string
  expirationSeconds?: number
  remember?: boolean
  redirectTo: string
}) {
  const session = await sessionStorage.getSession()
  session.set('userId', userId)

  const sessionExpirationDate = new Date()
  sessionExpirationDate.setSeconds(
    sessionExpirationDate.getSeconds() + expirationSeconds
  )

  session.set('expiresAt', sessionExpirationDate.toISOString())

  return redirect(redirectTo, {
    headers: {
      'Set-Cookie': await sessionStorage.commitSession(session, {
        maxAge: remember ? expirationSeconds : undefined, // Persist if remember is true
      }),
    },
  })
}

// Generate a refresh token cookie
export async function createRefreshTokenCookie(
  token: string,
  remember: boolean = false
) {
  const cookieOptions = {
    maxAge: remember ? 60 * 60 * 24 * 30 : undefined, // 30 days if remember me is checked
  }

  return refreshTokenCookie.serialize(token, cookieOptions)
}

// Logout and destroy the session
export async function logout(request: Request, userId?: string) {
  const session = await getUserSession(request)

  // If we have the userId, revoke all refresh tokens
  if (userId) {
    await userRepository.revokeAllUserRefreshTokens(userId)
  }

  // Clear both the auth cookie and refresh token cookie
  return redirect('/login', {
    headers: [
      ['Set-Cookie', await sessionStorage.destroySession(session)],
      ['Set-Cookie', await refreshTokenCookie.serialize('', { maxAge: 0 })],
    ],
  })
}

// Check if the current session has expired
export async function isSessionExpired(request: Request): Promise<boolean> {
  const session = await getUserSession(request)
  const expiresAt = session.get('expiresAt')

  if (!expiresAt) {
    return true
  }

  const expiresAtDate = new Date(expiresAt)
  const now = new Date()

  return expiresAtDate < now
}

interface ProfileUpdateData {
  full_name: string
}

/**
 * Updates a user's profile information
 */
export async function updateUserProfile(
  userId: string,
  data: ProfileUpdateData
): Promise<User> {
  // In a real application, this would update the user in the database
  // For now, we'll simulate this by returning a mock updated user
  const user = await getUserById(userId)

  if (!user) {
    throw new Error('User not found')
  }

  // Update the user with the new data
  const updatedUser = {
    ...user,
    ...data,
    updated_at: new Date().toISOString(),
  }

  // Here you would normally save this to the database
  // For demo purposes, we're just returning the updated user
  return updatedUser
}

/**
 * Login as a demo user without credentials
 */
export async function loginDemoUser(
  request: Request,
  redirectTo: string = '/overview'
): Promise<Response> {
  const demoUserId = 'demo-user-id'

  // Create a session for the demo user
  return createUserSession({
    request,
    userId: demoUserId,
    remember: false,
    redirectTo,
  })
}

/**
 * Retrieves a user by their ID
 */
export async function getUserById(userId: string): Promise<User | null> {
  if (!userId) {
    return null
  }

  // Special case for demo user
  if (userId === 'demo-user-id') {
    const demoUser: User = {
      id: 'demo-user-id',
      email: 'demo@example.com',
      full_name: 'Demo User',
      email_verified: true,
      mfa_enabled: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    return demoUser
  }

  // In a real app, you would fetch the user from your database here
  // For now, we'll simulate a user for demonstration purposes
  const mockUser: User = {
    id: userId,
    email: 'user@example.com',
    full_name: 'Example User',
    email_verified: true,
    mfa_enabled: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  return mockUser
}

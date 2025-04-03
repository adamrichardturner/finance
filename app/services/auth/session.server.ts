import { createCookieSessionStorage, redirect } from '@remix-run/node'
import { authCookie, refreshTokenCookie } from './auth.service'
import * as userRepository from '~/repositories/user.repository'
import { User } from '~/types/auth.types'
import { getDemoUserEnv } from '~/utils/env.server'

const sessionStorage = createCookieSessionStorage({
  cookie: authCookie,
})

const { demoUserId: DEMO_USER_ID } = getDemoUserEnv()

export async function getUserSession(request: Request) {
  return sessionStorage.getSession(request.headers.get('Cookie'))
}

export async function getUserId(
  request: Request
): Promise<string | number | null> {
  const session = await getUserSession(request)
  const userId = session.get('userId')

  if (!userId || (typeof userId !== 'string' && typeof userId !== 'number')) {
    return null
  }

  return userId
}

export async function getUser(request: Request) {
  const userId = await getUserId(request)

  if (!userId) {
    return null
  }

  const user = await userRepository.findUserById(String(userId))
  return user
}

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

export async function createUserSession({
  userId,
  expirationSeconds = 60 * 60 * 24 * 7,
  remember = false,
  redirectTo,
}: {
  request: Request
  userId: string | number | null
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
        maxAge: remember ? expirationSeconds : undefined,
      }),
    },
  })
}

export async function createRefreshTokenCookie(
  token: string,
  remember: boolean = false
) {
  const cookieOptions = {
    maxAge: remember ? 60 * 60 * 24 * 30 : undefined,
  }

  return refreshTokenCookie.serialize(token, cookieOptions)
}

export async function logout(request: Request, userId?: string) {
  const session = await getUserSession(request)

  if (userId) {
    await userRepository.revokeAllUserRefreshTokens(userId)
  }

  return redirect('/login', {
    headers: [
      ['Set-Cookie', await sessionStorage.destroySession(session)],
      ['Set-Cookie', await refreshTokenCookie.serialize('', { maxAge: 0 })],
    ],
  })
}

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

export async function updateUserProfile(
  userId: string,
  data: ProfileUpdateData
): Promise<User> {
  const user = await getUserById(userId)

  if (!user) {
    throw new Error('User not found')
  }

  const updatedUser = {
    ...user,
    ...data,
    updated_at: new Date().toISOString(),
  }

  return updatedUser
}

export async function loginDemoUser(request: Request): Promise<Response> {
  return createUserSession({
    request,
    userId: DEMO_USER_ID,
    remember: false,
    redirectTo: '/overview',
  })
}

export async function getUserById(
  userId: string | number
): Promise<User | null> {
  if (!userId) {
    return null
  }

  return userRepository.findUserById(String(userId))
}

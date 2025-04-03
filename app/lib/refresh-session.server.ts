import { createRequestHandler } from '@remix-run/express'
import {
  useRefreshToken,
  createUserRefreshToken,
  refreshTokenCookie,
} from '~/services/auth/auth.service'
import {
  getUserSession,
  isSessionExpired,
} from '~/services/auth/session.server'

import { createCookieSessionStorage } from '@remix-run/node'
import { authCookie } from '~/services/auth/auth.service'

const sessionStorage = createCookieSessionStorage({
  cookie: authCookie,
})

export function createSessionRefreshHandler(
  handler: ReturnType<typeof createRequestHandler>
) {
  return async (req: any, res: any, next: any) => {
    if (req.method !== 'GET') {
      return handler(req, res, next)
    }

    try {
      const isExpired = await isSessionExpired(req)

      if (!isExpired) {
        return handler(req, res, next)
      }

      const cookies = req.headers.get('Cookie') || ''
      const refreshToken = await refreshTokenCookie.parse(cookies)

      if (!refreshToken) {
        return handler(req, res, next)
      }

      const user = await useRefreshToken(refreshToken)

      if (!user) {
        return handler(req, res, next)
      }

      const newRefreshToken = await createUserRefreshToken(
        user.id,
        refreshToken.device_info
      )

      const session = await getUserSession(req)
      session.set('userId', user.id)

      const expirationSeconds = 60 * 60 * 24 * 7
      const sessionExpirationDate = new Date()
      sessionExpirationDate.setSeconds(
        sessionExpirationDate.getSeconds() + expirationSeconds
      )

      session.set('expiresAt', sessionExpirationDate.toISOString())

      res.setHeader('Set-Cookie', [
        await sessionStorage.commitSession(session, {
          maxAge: expirationSeconds,
        }),
        await refreshTokenCookie.serialize(newRefreshToken, {
          maxAge: 60 * 60 * 24 * 30,
        }),
      ])

      res.redirect(302, req.url)
      return
    } catch (error) {
      console.error('Error refreshing session:', error)

      return handler(req, res, next)
    }
  }
}

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

// Re-export session storage from auth service
import { createCookieSessionStorage } from '@remix-run/node'
import { authCookie } from '~/services/auth/auth.service'

// Create session storage for middleware
const sessionStorage = createCookieSessionStorage({
  cookie: authCookie,
})

/**
 * Enhances the Remix request handler to support automatic session refreshing
 */
export function createSessionRefreshHandler(
  handler: ReturnType<typeof createRequestHandler>
) {
  return async (req: any, res: any, next: any) => {
    // Only process GET requests
    if (req.method !== 'GET') {
      return handler(req, res, next)
    }

    try {
      // Check if the session is expired
      const isExpired = await isSessionExpired(req)

      if (!isExpired) {
        // Session is still valid, proceed normally
        return handler(req, res, next)
      }

      // Session is expired, try to refresh using the refresh token
      const cookies = req.headers.get('Cookie') || ''
      const refreshToken = await refreshTokenCookie.parse(cookies)

      if (!refreshToken) {
        // No refresh token, proceed to normal flow (will redirect to login if needed)
        return handler(req, res, next)
      }

      // Try to get a new session using the refresh token
      const user = await useRefreshToken(refreshToken)

      if (!user) {
        // Invalid or expired refresh token, proceed to normal flow
        return handler(req, res, next)
      }

      // Create a new refresh token for token rotation
      const newRefreshToken = await createUserRefreshToken(
        user.id,
        refreshToken.device_info
      )

      // Create a new session
      const session = await getUserSession(req)
      session.set('userId', user.id)

      const expirationSeconds = 60 * 60 * 24 * 7 // 7 days
      const sessionExpirationDate = new Date()
      sessionExpirationDate.setSeconds(
        sessionExpirationDate.getSeconds() + expirationSeconds
      )

      session.set('expiresAt', sessionExpirationDate.toISOString())

      // Set the cookies
      res.setHeader('Set-Cookie', [
        await sessionStorage.commitSession(session, {
          maxAge: expirationSeconds,
        }),
        await refreshTokenCookie.serialize(newRefreshToken, {
          maxAge: 60 * 60 * 24 * 30, // 30 days
        }),
      ])

      // Redirect to the same URL to refresh the page
      res.redirect(302, req.url)
      return
    } catch (error) {
      console.error('Error refreshing session:', error)
      // If anything goes wrong, fallback to the regular handler
      return handler(req, res, next)
    }
  }
}

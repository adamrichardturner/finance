// Declaration file for Express + Remix integration
import 'express'
import { Session } from '@remix-run/node'

// Extend Express Request to include Remix-specific methods
declare module 'express' {
  interface Request {
    headers: Express.Request['headers'] & {
      get(name: string): string | undefined
    }
  }
}

// Define a type for the session.server.ts functions that take Express + Remix requests
declare module '~/services/auth/session.server' {
  function getUserSession(request: Express.Request): Promise<Session>
  function isSessionExpired(request: Express.Request): Promise<boolean>
}

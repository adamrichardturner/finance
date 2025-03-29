import { createCookieSessionStorage } from '@remix-run/node'
import { Transaction } from '~/hooks/use-financial-data'
import { MonzoServiceInterface } from './monzo.service'

// Monzo API interfaces
interface MonzoAccount {
  id: string
  description: string
  created: string
}

interface MonzoTransaction {
  id: string
  created: string
  description: string
  amount: number
  currency: string
  merchant?: {
    id: string
    name: string
    logo: string
    category: string
  }
  notes: string
  category: string
}

interface MonzoBalance {
  balance: number
  total_balance: number
  currency: string
  spend_today: number
}

interface TokenResponse {
  access_token: string
  client_id: string
  expires_in: number
  refresh_token: string
  token_type: string
  user_id: string
}

// Create session storage for Monzo tokens
const monzoSessionStorage = createCookieSessionStorage({
  cookie: {
    name: 'monzo_session',
    secure: process.env.NODE_ENV === 'production',
    secrets: [process.env.SESSION_SECRET || 'monzo-session-secret'],
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    httpOnly: true,
  },
})

/**
 * Actual server-side implementation of MonzoService
 */
class MonzoService implements MonzoServiceInterface {
  private accessToken: string | null = null
  private refreshToken: string | null = null
  private clientId: string = process.env.MONZO_CLIENT_ID || ''
  private clientSecret: string = process.env.MONZO_CLIENT_SECRET || ''
  private redirectUri: string =
    process.env.MONZO_REDIRECT_URI || 'http://localhost:3000/monzo-auth'
  private expiresAt: number = 0

  async initializeFromRequest(request: Request) {
    const cookieHeader = request.headers.get('Cookie')
    const session = await monzoSessionStorage.getSession(cookieHeader)

    this.accessToken = session.get('access_token')
    this.refreshToken = session.get('refresh_token')
    this.expiresAt = session.get('expires_at') || 0

    if (this.accessToken && this.expiresAt < Date.now()) {
      await this.refreshAccessToken()
    }
  }

  isAuthenticated(): boolean {
    return !!this.accessToken && this.expiresAt > Date.now()
  }

  getAuthorizationUrl(state: string): string {
    const baseUrl = 'https://auth.monzo.com'
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      state: state,
    })

    return `${baseUrl}?${params.toString()}`
  }

  async exchangeCodeForToken(code: string): Promise<TokenResponse> {
    const response = await fetch('https://api.monzo.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.redirectUri,
        code,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to exchange code for token')
    }

    const tokenData = await response.json()
    this.accessToken = tokenData.access_token
    this.refreshToken = tokenData.refresh_token
    this.expiresAt = Date.now() + tokenData.expires_in * 1000

    return tokenData
  }

  async refreshAccessToken(): Promise<void> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available')
    }

    const response = await fetch('https://api.monzo.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: this.refreshToken,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to refresh access token')
    }

    const tokenData = await response.json()
    this.accessToken = tokenData.access_token
    this.refreshToken = tokenData.refresh_token
    this.expiresAt = Date.now() + tokenData.expires_in * 1000
  }

  async createUserSession(tokenData: TokenResponse): Promise<string> {
    const session = await monzoSessionStorage.getSession()

    session.set('access_token', tokenData.access_token)
    session.set('refresh_token', tokenData.refresh_token)
    session.set('expires_at', Date.now() + tokenData.expires_in * 1000)

    return monzoSessionStorage.commitSession(session)
  }

  async makeRequest<T>(
    endpoint: string,
    method: string = 'GET',
    body?: any
  ): Promise<T> {
    if (!this.accessToken) {
      throw new Error('No access token available')
    }

    if (this.expiresAt < Date.now()) {
      await this.refreshAccessToken()
    }

    const options: RequestInit = {
      method,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
    }

    if (body) {
      options.body = JSON.stringify(body)
    }

    const response = await fetch(`https://api.monzo.com/${endpoint}`, options)

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`)
    }

    return response.json()
  }

  async getAccounts(): Promise<MonzoAccount[]> {
    const response = await this.makeRequest<{ accounts: MonzoAccount[] }>(
      'accounts'
    )
    return response.accounts
  }

  async getBalance(accountId: string): Promise<MonzoBalance> {
    return this.makeRequest<MonzoBalance>(`balance?account_id=${accountId}`)
  }

  async getTransactions(accountId: string): Promise<MonzoTransaction[]> {
    const response = await this.makeRequest<{
      transactions: MonzoTransaction[]
    }>(`transactions?account_id=${accountId}&expand[]=merchant`)
    return response.transactions
  }

  async getFinancialData() {
    try {
      const accounts = await this.getAccounts()
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found')
      }

      const mainAccount = accounts[0]

      const balance = await this.getBalance(mainAccount.id)
      const transactions = await this.getTransactions(mainAccount.id)

      let income = 0
      let expenses = 0

      const transformedTransactions = transactions.map((tx) => {
        const amount = tx.amount / 100 // Convert from pennies to pounds
        if (amount > 0) {
          income += amount
        } else {
          expenses += Math.abs(amount)
        }

        return {
          id: tx.id,
          date: new Date(tx.created).toISOString().slice(0, 10),
          description: tx.merchant?.name || tx.description,
          amount: amount,
          type: amount > 0 ? 'income' : 'expense',
          category: tx.category,
          avatar: tx.merchant?.logo,
        } as Transaction
      })

      return {
        balance: balance.balance / 100,
        income,
        expenses,
        transactions: transformedTransactions,
        budgets: [],
        pots: [],
      }
    } catch (error) {
      console.error('Error getting financial data:', error)
      // Return empty data on error
      return {
        balance: 0,
        income: 0,
        expenses: 0,
        transactions: [],
        budgets: [],
        pots: [],
      }
    }
  }
}

// Factory function to create a new MonzoService instance
export function createMonzoService() {
  return new MonzoService()
}

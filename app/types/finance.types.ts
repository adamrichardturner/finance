export interface Balance {
  id?: number
  current: number
  income: number
  expenses: number
  created_at?: string
  updated_at?: string
}

export interface Transaction {
  id?: number
  avatar: string
  name: string
  category: string
  date: string | Date
  amount: number
  recurring: boolean
  dueDay?: number
  isPaid?: boolean
  isOverdue?: boolean
  created_at?: string
  updated_at?: string
}

export interface Budget {
  id: number
  category: string
  maximum: string
  theme: string
  transactions?: Transaction[]
  user_id: string
  created_at?: string
  updated_at?: string
}

export interface Pot {
  id?: number
  name: string
  target: number
  total: number
  theme: string
  created_at?: string
  updated_at?: string
}

export interface FinancialData {
  balance: Balance
  transactions: Transaction[]
  budgets: Budget[]
  pots: Pot[]
}

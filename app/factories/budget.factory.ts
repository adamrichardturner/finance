import { EntityFactory } from './entity-factory.interface'
import { Budget, Transaction } from '~/types/finance.types'
import { AppTransaction } from '~/utils/transform-data'
import { TransactionFactory } from './transaction.factory'
import { getThemeForCategory } from '~/utils/budget-categories'

export interface CreateBudgetParams {
  category: string
  maxAmount: number
  theme?: string
  userId: string
}

export interface UpdateBudgetParams
  extends Partial<Omit<CreateBudgetParams, 'userId'>> {
  id: number
  userId: string
}

/**
 * Factory for creating and validating Budget entities
 */
export class BudgetFactory
  implements EntityFactory<Budget, CreateBudgetParams, UpdateBudgetParams>
{
  private static instance: BudgetFactory
  private transactionFactory: TransactionFactory

  private constructor() {
    this.transactionFactory = TransactionFactory.getInstance()
  }

  /**
   * Get the singleton instance of BudgetFactory
   */
  static getInstance(): BudgetFactory {
    if (!BudgetFactory.instance) {
      BudgetFactory.instance = new BudgetFactory()
    }
    return BudgetFactory.instance
  }

  /**
   * Create a new Budget with validation
   */
  create(params: CreateBudgetParams): Budget {
    const validationError = this.validate(params)
    if (validationError) {
      throw new Error(validationError)
    }

    // Use the category's default theme if not provided
    const theme = params.theme || getThemeForCategory(params.category)

    return {
      id: -1, // Temporary ID until saved to database
      category: params.category,
      maximum: params.maxAmount.toString(),
      theme,
      user_id: params.userId,
      transactions: [],
    }
  }

  /**
   * Create a Budget from a raw database object
   */
  fromRaw(raw: any): Budget {
    if (!raw) {
      throw new Error('Cannot create budget from null or undefined')
    }

    const transactions: Transaction[] = []

    // Transform transactions if they exist
    if (raw.transactions && Array.isArray(raw.transactions)) {
      raw.transactions.forEach((tx: any) => {
        const appTx = this.transactionFactory.fromRaw(tx)
        // Convert AppTransaction back to Transaction format
        transactions.push({
          id: parseInt(appTx.id) || undefined,
          name: appTx.description,
          category: appTx.category,
          date: appTx.date,
          amount: appTx.amount,
          avatar: appTx.avatar || '',
          recurring: appTx.recurring || false,
          dueDay: appTx.dueDay,
          isPaid: appTx.isPaid,
          isOverdue: appTx.isOverdue,
        })
      })
    }

    return {
      id: raw.id,
      category: raw.category,
      maximum: raw.maximum.toString(),
      theme: raw.theme,
      user_id: raw.user_id,
      transactions,
      created_at: raw.created_at,
      updated_at: raw.updated_at,
    }
  }

  /**
   * Update an existing Budget
   */
  update(budget: Budget, params: UpdateBudgetParams): Budget {
    const validationError = this.validateUpdate(params)
    if (validationError) {
      throw new Error(validationError)
    }

    return {
      ...budget,
      category: params.category ?? budget.category,
      maximum:
        params.maxAmount !== undefined
          ? params.maxAmount.toString()
          : budget.maximum,
      theme: params.theme ?? budget.theme,
      user_id: params.userId,
    }
  }

  /**
   * Validate budget creation parameters
   */
  validate(params: CreateBudgetParams | Budget): string | null {
    // Handle Budget object
    if ('id' in params) {
      const budget = params as Budget

      if (!budget.category) {
        return 'Category is required'
      }

      if (!budget.maximum) {
        return 'Maximum amount is required'
      }

      const maxAmount = parseFloat(budget.maximum)
      if (isNaN(maxAmount) || maxAmount < 0) {
        return 'Maximum amount must be a positive number'
      }

      if (!budget.user_id) {
        return 'User ID is required'
      }

      return null
    }

    // Handle CreateBudgetParams
    if (!params.category || !params.category.trim()) {
      return 'Category is required'
    }

    if (params.maxAmount === undefined || params.maxAmount === null) {
      return 'Maximum amount is required'
    }

    if (typeof params.maxAmount !== 'number' || params.maxAmount < 0) {
      return 'Maximum amount must be a positive number'
    }

    if (params.category.toLowerCase() === 'income') {
      return 'Income cannot be used as a budget category'
    }

    if (!params.userId) {
      return 'User ID is required'
    }

    return null
  }

  /**
   * Validate budget update parameters
   */
  private validateUpdate(params: UpdateBudgetParams): string | null {
    if (params.id === undefined) {
      return 'Budget ID is required for updates'
    }

    if (!params.userId) {
      return 'User ID is required'
    }

    if (
      params.category !== undefined &&
      (!params.category || params.category.trim() === '')
    ) {
      return 'Category cannot be empty'
    }

    if (
      params.category !== undefined &&
      params.category.toLowerCase() === 'income'
    ) {
      return 'Income cannot be used as a budget category'
    }

    if (
      params.maxAmount !== undefined &&
      (typeof params.maxAmount !== 'number' || params.maxAmount < 0)
    ) {
      return 'Maximum amount must be a positive number'
    }

    return null
  }

  /**
   * Add a transaction to a budget
   */
  addTransaction(
    budget: Budget,
    transaction: Transaction | AppTransaction
  ): Budget {
    // Convert AppTransaction to Transaction if needed
    let tx: Transaction

    if ('description' in transaction) {
      // It's an AppTransaction, convert to Transaction
      tx = {
        id: parseInt(transaction.id) || undefined,
        name: transaction.description,
        category: transaction.category,
        date: transaction.date,
        amount: transaction.amount,
        avatar: transaction.avatar || '',
        recurring: transaction.recurring || false,
        dueDay: transaction.dueDay,
        isPaid: transaction.isPaid,
        isOverdue: transaction.isOverdue,
      }
    } else {
      tx = transaction
    }

    const transactions = [...(budget.transactions || []), tx]

    return {
      ...budget,
      transactions,
    }
  }
}

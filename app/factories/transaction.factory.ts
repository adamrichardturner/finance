import { EntityFactory } from './entity-factory.interface'
import { Transaction } from '~/types/finance.types'
import { AppTransaction } from '~/utils/transform-data'
import { processAvatarPath } from '~/utils/avatar-utils'

export interface CreateTransactionParams {
  name: string
  category: string
  date: string | Date
  amount: number
  avatar?: string
  recurring?: boolean
  dueDay?: number
  isPaid?: boolean
  isOverdue?: boolean
}

export interface UpdateTransactionParams
  extends Partial<CreateTransactionParams> {
  id: string | number
}

/**
 * Factory for creating and validating Transaction entities
 */
export class TransactionFactory
  implements
    EntityFactory<
      AppTransaction,
      CreateTransactionParams,
      UpdateTransactionParams
    >
{
  private static instance: TransactionFactory

  private constructor() {}

  /**
   * Get the singleton instance of TransactionFactory
   */
  static getInstance(): TransactionFactory {
    if (!TransactionFactory.instance) {
      TransactionFactory.instance = new TransactionFactory()
    }
    return TransactionFactory.instance
  }

  /**
   * Create a new AppTransaction with validation
   */
  create(params: CreateTransactionParams): AppTransaction {
    const validationError = this.validate(params)
    if (validationError) {
      throw new Error(validationError)
    }

    const id = Math.random().toString(36).substring(2, 9)
    const avatar = params.avatar ? processAvatarPath(params.avatar) : undefined

    return {
      id,
      description: params.name,
      date: this.formatDate(params.date),
      amount: params.amount,
      type: params.amount >= 0 ? 'income' : 'expense',
      category: params.category,
      avatar,
      recurring: params.recurring || false,
      dueDay:
        params.dueDay ||
        (params.date instanceof Date
          ? params.date.getDate()
          : new Date(params.date).getDate()),
      isPaid: params.isPaid,
      isOverdue: params.isOverdue,
    }
  }

  /**
   * Create an AppTransaction from a raw Transaction object
   */
  fromRaw(raw: Transaction): AppTransaction {
    return {
      id: raw.id?.toString() || Math.random().toString(36).substring(2, 9),
      date: this.formatDate(raw.date),
      description: raw.name,
      amount: raw.amount,
      type: raw.amount >= 0 ? 'income' : 'expense',
      category: raw.category,
      avatar: processAvatarPath(raw.avatar),
      recurring: raw.recurring,
      dueDay:
        raw.dueDay ||
        (raw.date instanceof Date
          ? raw.date.getDate()
          : new Date(raw.date).getDate()),
      isPaid: raw.isPaid,
      isOverdue: raw.isOverdue,
    }
  }

  /**
   * Update an existing AppTransaction
   */
  update(
    transaction: AppTransaction,
    params: UpdateTransactionParams
  ): AppTransaction {
    const validationError = this.validateUpdate(params)
    if (validationError) {
      throw new Error(validationError)
    }

    return {
      ...transaction,
      description: params.name ?? transaction.description,
      date: params.date ? this.formatDate(params.date) : transaction.date,
      amount: params.amount ?? transaction.amount,
      type:
        params.amount !== undefined
          ? params.amount >= 0
            ? 'income'
            : 'expense'
          : transaction.type,
      category: params.category ?? transaction.category,
      avatar: params.avatar
        ? processAvatarPath(params.avatar)
        : transaction.avatar,
      recurring: params.recurring ?? transaction.recurring,
      dueDay: params.dueDay ?? transaction.dueDay,
      isPaid: params.isPaid ?? transaction.isPaid,
      isOverdue: params.isOverdue ?? transaction.isOverdue,
    }
  }

  /**
   * Validate creation parameters
   */
  validate(params: CreateTransactionParams | AppTransaction): string | null {
    if ('description' in params) {
      // It's an AppTransaction
      if (!params.description.trim()) {
        return 'Description is required'
      }
      if (!params.category.trim()) {
        return 'Category is required'
      }
      if (!params.date) {
        return 'Date is required'
      }
      if (typeof params.amount !== 'number') {
        return 'Amount must be a number'
      }
    } else {
      // It's CreateTransactionParams
      if (!params.name || !params.name.trim()) {
        return 'Name is required'
      }
      if (!params.category || !params.category.trim()) {
        return 'Category is required'
      }
      if (!params.date) {
        return 'Date is required'
      }
      if (typeof params.amount !== 'number') {
        return 'Amount must be a number'
      }
    }

    return null
  }

  /**
   * Validate update parameters
   */
  private validateUpdate(params: UpdateTransactionParams): string | null {
    if (!params.id) {
      return 'Transaction ID is required for updates'
    }

    if (params.name !== undefined && !params.name.trim()) {
      return 'Name cannot be empty'
    }

    if (params.category !== undefined && !params.category.trim()) {
      return 'Category cannot be empty'
    }

    if (params.amount !== undefined && typeof params.amount !== 'number') {
      return 'Amount must be a number'
    }

    return null
  }

  /**
   * Format date to ISO string date (YYYY-MM-DD)
   */
  private formatDate(date: string | Date): string {
    if (date instanceof Date) {
      return date.toISOString().split('T')[0]
    }
    return new Date(date).toISOString().split('T')[0]
  }
}

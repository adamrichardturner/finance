import { TransactionGroupStrategy } from './transaction-strategy.interface'
import { AppTransaction } from '~/utils/transform-data'

/**
 * Base abstract class for transaction grouping strategies
 */
export abstract class BaseGroupStrategy implements TransactionGroupStrategy {
  constructor(
    public readonly groupName: string,
    public readonly displayName: string
  ) {}

  abstract execute(
    transactions: AppTransaction[]
  ): Record<string, AppTransaction[]>
}

/**
 * Group transactions by category
 */
export class CategoryGroupStrategy extends BaseGroupStrategy {
  constructor() {
    super('category', 'By Category')
  }

  execute(transactions: AppTransaction[]): Record<string, AppTransaction[]> {
    return transactions.reduce(
      (groups, transaction) => {
        // Normalize the category name for consistency
        const category =
          transaction.category.charAt(0).toUpperCase() +
          transaction.category.slice(1).toLowerCase()

        if (!groups[category]) {
          groups[category] = []
        }

        groups[category].push(transaction)
        return groups
      },
      {} as Record<string, AppTransaction[]>
    )
  }
}

/**
 * Group transactions by month
 */
export class MonthGroupStrategy extends BaseGroupStrategy {
  constructor() {
    super('month', 'By Month')
  }

  execute(transactions: AppTransaction[]): Record<string, AppTransaction[]> {
    return transactions.reduce(
      (groups, transaction) => {
        const date = new Date(transaction.date)
        const monthYear = `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`

        if (!groups[monthYear]) {
          groups[monthYear] = []
        }

        groups[monthYear].push(transaction)
        return groups
      },
      {} as Record<string, AppTransaction[]>
    )
  }
}

/**
 * Group transactions by type (income/expense)
 */
export class TypeGroupStrategy extends BaseGroupStrategy {
  constructor() {
    super('type', 'Income vs. Expenses')
  }

  execute(transactions: AppTransaction[]): Record<string, AppTransaction[]> {
    return transactions.reduce(
      (groups, transaction) => {
        const type = transaction.amount >= 0 ? 'Income' : 'Expenses'

        if (!groups[type]) {
          groups[type] = []
        }

        groups[type].push(transaction)
        return groups
      },
      {} as Record<string, AppTransaction[]>
    )
  }
}

/**
 * Group transactions by recipient/sender
 */
export class RecipientGroupStrategy extends BaseGroupStrategy {
  constructor() {
    super('recipient', 'By Recipient/Sender')
  }

  execute(transactions: AppTransaction[]): Record<string, AppTransaction[]> {
    return transactions.reduce(
      (groups, transaction) => {
        const recipient = transaction.description

        if (!groups[recipient]) {
          groups[recipient] = []
        }

        groups[recipient].push(transaction)
        return groups
      },
      {} as Record<string, AppTransaction[]>
    )
  }
}

/**
 * Factory for creating grouping strategies
 */
export class GroupStrategyFactory {
  private static strategies: Record<string, TransactionGroupStrategy> = {
    category: new CategoryGroupStrategy(),
    month: new MonthGroupStrategy(),
    type: new TypeGroupStrategy(),
    recipient: new RecipientGroupStrategy(),
  }

  static getStrategy(name: string): TransactionGroupStrategy {
    return this.strategies[name]
  }

  static getAllStrategies(): TransactionGroupStrategy[] {
    return Object.values(this.strategies)
  }
}

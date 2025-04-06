import { TransactionFilterStrategy } from './transaction-strategy.interface'
import { AppTransaction } from '~/utils/transform-data'

/**
 * Base abstract class for transaction filter strategies
 */
export abstract class BaseFilterStrategy implements TransactionFilterStrategy {
  constructor(
    public readonly filterName: string,
    public readonly displayName: string
  ) {}

  abstract matches(transaction: AppTransaction): boolean

  execute(transactions: AppTransaction[]): AppTransaction[] {
    return transactions.filter((tx) => this.matches(tx))
  }
}

/**
 * Filter transactions by category
 */
export class CategoryFilterStrategy extends BaseFilterStrategy {
  constructor(private category: string) {
    super(
      `category:${category.toLowerCase()}`,
      category.charAt(0).toUpperCase() + category.slice(1)
    )
  }

  matches(transaction: AppTransaction): boolean {
    // Special case for "All Transactions" category or "all" category
    if (
      this.category.toLowerCase() === 'all transactions' ||
      this.category.toLowerCase() === 'all'
    ) {
      return true
    }

    // Handle special cases for pot-related transactions
    if (this.category.toLowerCase() === 'savings') {
      return (
        transaction.category.toLowerCase() === 'savings' ||
        transaction.description.toLowerCase().includes('savings pot') ||
        transaction.description.toLowerCase().includes('transfer to pot') ||
        transaction.description.toLowerCase().includes('adding to pot')
      )
    }

    if (this.category.toLowerCase() === 'withdrawal') {
      return (
        transaction.category.toLowerCase() === 'withdrawal' ||
        transaction.description.toLowerCase().includes('withdrawal from') ||
        transaction.description.toLowerCase().includes('pot withdrawal')
      )
    }

    if (this.category.toLowerCase() === 'return') {
      return (
        transaction.category.toLowerCase() === 'return' ||
        transaction.description.toLowerCase().includes('returned funds') ||
        transaction.description
          .toLowerCase()
          .includes('pot balance returned') ||
        transaction.description.toLowerCase().includes('deleted pot')
      )
    }

    // Standard category matching
    return transaction.category.toLowerCase() === this.category.toLowerCase()
  }
}

/**
 * Filter income transactions
 */
export class IncomeFilterStrategy extends BaseFilterStrategy {
  constructor() {
    super('income', 'Income')
  }

  matches(transaction: AppTransaction): boolean {
    return transaction.amount > 0
  }
}

/**
 * Filter expense transactions
 */
export class ExpenseFilterStrategy extends BaseFilterStrategy {
  constructor() {
    super('expense', 'Expenses')
  }

  matches(transaction: AppTransaction): boolean {
    return transaction.amount < 0
  }
}

/**
 * Filter by text search
 */
export class TextSearchFilterStrategy extends BaseFilterStrategy {
  constructor(private searchText: string) {
    super(`search:${searchText}`, `Search: ${searchText}`)
  }

  matches(transaction: AppTransaction): boolean {
    if (!this.searchText) {
      return true
    }

    const search = this.searchText.toLowerCase().trim()

    // Safely handle potential null/undefined values
    const description = transaction.description?.toLowerCase() || ''
    const category = transaction.category?.toLowerCase() || ''
    const amount = transaction.amount?.toString() || ''

    return (
      description.includes(search) ||
      category.includes(search) ||
      amount.includes(search)
    )
  }
}

/**
 * Filter by date range
 */
export class DateRangeFilterStrategy extends BaseFilterStrategy {
  constructor(
    private startDate: Date,
    private endDate: Date
  ) {
    super(
      `date:${startDate.toISOString()}-${endDate.toISOString()}`,
      `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
    )
  }

  matches(transaction: AppTransaction): boolean {
    const txDate = new Date(transaction.date)
    return txDate >= this.startDate && txDate <= this.endDate
  }
}

/**
 * Composite filter strategy that combines multiple filters with AND logic
 */
export class CompositeFilterStrategy implements TransactionFilterStrategy {
  readonly filterName: string
  readonly displayName: string

  constructor(private filters: TransactionFilterStrategy[]) {
    this.filterName = `composite:${filters.map((f) => f.filterName).join('+')}`
    this.displayName = `Combined Filters (${filters.length})`
  }

  matches(transaction: AppTransaction): boolean {
    // All filters must match (AND logic)
    return this.filters.every((filter) => filter.matches(transaction))
  }

  execute(transactions: AppTransaction[]): AppTransaction[] {
    return transactions.filter((tx) => this.matches(tx))
  }
}

/**
 * Factory for creating filter strategies
 */
export class FilterStrategyFactory {
  // Create a category filter
  static createCategoryFilter(category: string): TransactionFilterStrategy {
    return new CategoryFilterStrategy(category)
  }

  // Create a text search filter
  static createSearchFilter(searchText: string): TransactionFilterStrategy {
    return new TextSearchFilterStrategy(searchText)
  }

  // Create a composite filter from multiple strategies
  static createCompositeFilter(
    filters: TransactionFilterStrategy[]
  ): TransactionFilterStrategy {
    return new CompositeFilterStrategy(filters)
  }

  // Get all predefined filters
  static getBasicFilters(): TransactionFilterStrategy[] {
    return [new IncomeFilterStrategy(), new ExpenseFilterStrategy()]
  }
}

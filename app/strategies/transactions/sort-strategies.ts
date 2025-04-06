import {
  TransactionSortStrategy,
  SortOption,
} from './transaction-strategy.interface'
import { AppTransaction } from '~/utils/transform-data'
import orderBy from 'lodash/orderBy'

/**
 * Base abstract class for transaction sort strategies
 */
export abstract class BaseSortStrategy implements TransactionSortStrategy {
  constructor(
    public readonly sortOption: SortOption,
    public readonly displayName: string
  ) {}

  abstract execute(transactions: AppTransaction[]): AppTransaction[]
}

/**
 * Sort by transaction date (newest first)
 */
export class LatestSortStrategy extends BaseSortStrategy {
  constructor() {
    super('latest', 'Latest')
  }

  execute(transactions: AppTransaction[]): AppTransaction[] {
    return orderBy(
      transactions,
      [(tx: AppTransaction) => new Date(tx.date).getTime()],
      ['desc']
    )
  }
}

/**
 * Sort by transaction date (oldest first)
 */
export class OldestSortStrategy extends BaseSortStrategy {
  constructor() {
    super('oldest', 'Oldest')
  }

  execute(transactions: AppTransaction[]): AppTransaction[] {
    return orderBy(
      transactions,
      [(tx: AppTransaction) => new Date(tx.date).getTime()],
      ['asc']
    )
  }
}

/**
 * Sort alphabetically by transaction description (A to Z)
 */
export class AlphabeticalSortStrategy extends BaseSortStrategy {
  constructor() {
    super('a-z', 'A to Z')
  }

  execute(transactions: AppTransaction[]): AppTransaction[] {
    return orderBy(transactions, ['description'], ['asc'])
  }
}

/**
 * Sort alphabetically by transaction description (Z to A)
 */
export class ReverseAlphabeticalSortStrategy extends BaseSortStrategy {
  constructor() {
    super('z-a', 'Z to A')
  }

  execute(transactions: AppTransaction[]): AppTransaction[] {
    return orderBy(transactions, ['description'], ['desc'])
  }
}

/**
 * Sort by transaction amount (highest first)
 */
export class HighestAmountSortStrategy extends BaseSortStrategy {
  constructor() {
    super('highest', 'Highest Amount')
  }

  execute(transactions: AppTransaction[]): AppTransaction[] {
    return orderBy(
      transactions,
      [(tx: AppTransaction) => (tx.amount >= 0 ? 1 : 0), 'amount'],
      ['desc', 'desc']
    )
  }
}

/**
 * Sort by transaction amount (lowest first)
 */
export class LowestAmountSortStrategy extends BaseSortStrategy {
  constructor() {
    super('lowest', 'Lowest Amount')
  }

  execute(transactions: AppTransaction[]): AppTransaction[] {
    return orderBy(
      transactions,
      [(tx: AppTransaction) => (tx.amount < 0 ? 0 : 1), 'amount'],
      ['asc', 'asc']
    )
  }
}

/**
 * Factory to get appropriate sort strategy by option
 */
export class SortStrategyFactory {
  private static strategies: Record<SortOption, TransactionSortStrategy> = {
    latest: new LatestSortStrategy(),
    oldest: new OldestSortStrategy(),
    'a-z': new AlphabeticalSortStrategy(),
    'z-a': new ReverseAlphabeticalSortStrategy(),
    highest: new HighestAmountSortStrategy(),
    lowest: new LowestAmountSortStrategy(),
  }

  static getStrategy(option: SortOption): TransactionSortStrategy {
    return this.strategies[option]
  }

  static getAllStrategies(): TransactionSortStrategy[] {
    return Object.values(this.strategies)
  }
}

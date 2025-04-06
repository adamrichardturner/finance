import { AppTransaction } from '~/utils/transform-data'

/**
 * Base strategy interface for all transaction operations
 */
export interface TransactionStrategy<TInput, TOutput> {
  execute(input: TInput): TOutput
}

/**
 * Sort options for transactions
 */
export type SortOption =
  | 'latest'
  | 'oldest'
  | 'a-z'
  | 'z-a'
  | 'highest'
  | 'lowest'

/**
 * Strategy for sorting transactions
 */
export interface TransactionSortStrategy
  extends TransactionStrategy<AppTransaction[], AppTransaction[]> {
  readonly sortOption: SortOption
  readonly displayName: string
}

/**
 * Strategy for filtering transactions
 */
export interface TransactionFilterStrategy
  extends TransactionStrategy<AppTransaction[], AppTransaction[]> {
  readonly filterName: string
  readonly displayName: string

  // Return if this filter applies to a specific transaction
  matches(transaction: AppTransaction): boolean
}

/**
 * Strategy for grouping transactions
 */
export interface TransactionGroupStrategy
  extends TransactionStrategy<
    AppTransaction[],
    Record<string, AppTransaction[]>
  > {
  readonly groupName: string
  readonly displayName: string
}

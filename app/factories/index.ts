import { TransactionFactory } from './transaction.factory'
import { BudgetFactory } from './budget.factory'
import { PotFactory } from './pot.factory'

export type {
  CreateTransactionParams,
  UpdateTransactionParams,
} from './transaction.factory'

export type { CreateBudgetParams, UpdateBudgetParams } from './budget.factory'

export type {
  CreatePotParams,
  UpdatePotParams,
  PotMoneyTransactionParams,
} from './pot.factory'

/**
 * Registry that provides access to all entity factories
 */
export class FactoryRegistry {
  private static instance: FactoryRegistry

  // Factories
  readonly transactions: TransactionFactory
  readonly budgets: BudgetFactory
  readonly pots: PotFactory

  private constructor() {
    this.transactions = TransactionFactory.getInstance()
    this.budgets = BudgetFactory.getInstance()
    this.pots = PotFactory.getInstance()
  }

  /**
   * Get the singleton instance of the factory registry
   */
  static getInstance(): FactoryRegistry {
    if (!FactoryRegistry.instance) {
      FactoryRegistry.instance = new FactoryRegistry()
    }
    return FactoryRegistry.instance
  }
}

/**
 * Helper function to get access to the factory registry
 */
export function useFactories(): FactoryRegistry {
  return FactoryRegistry.getInstance()
}

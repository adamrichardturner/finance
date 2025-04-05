import { EntityFactory } from './entity-factory.interface'
import { Pot } from '~/types/finance.types'
import { THEME_COLORS } from '~/utils/budget-categories'

export interface CreatePotParams {
  name: string
  target: number
  theme: string
  initialAmount?: number
}

export interface UpdatePotParams extends Partial<CreatePotParams> {
  id: number
}

export interface PotMoneyTransactionParams {
  amount: number
}

/**
 * Factory for creating and validating Pot entities
 */
export class PotFactory
  implements EntityFactory<Pot, CreatePotParams, UpdatePotParams>
{
  private static instance: PotFactory
  private readonly MAX_NAME_LENGTH = 30

  private constructor() {}

  /**
   * Get the singleton instance of PotFactory
   */
  static getInstance(): PotFactory {
    if (!PotFactory.instance) {
      PotFactory.instance = new PotFactory()
    }
    return PotFactory.instance
  }

  /**
   * Create a new Pot with validation
   */
  create(params: CreatePotParams): Pot {
    const validationError = this.validate(params)
    if (validationError) {
      throw new Error(validationError)
    }

    return {
      id: -1, // Temporary ID until saved to database
      name: params.name,
      target: params.target,
      total: params.initialAmount || 0,
      theme: params.theme || THEME_COLORS[0].value,
    }
  }

  /**
   * Create a Pot from a raw database object
   */
  fromRaw(raw: any): Pot {
    if (!raw) {
      throw new Error('Cannot create pot from null or undefined')
    }

    return {
      id: raw.id,
      name: raw.name,
      target: parseFloat(raw.target),
      total: parseFloat(raw.total || 0),
      theme: raw.theme,
      created_at: raw.created_at,
      updated_at: raw.updated_at,
    }
  }

  /**
   * Update an existing Pot
   */
  update(pot: Pot, params: UpdatePotParams): Pot {
    const validationError = this.validateUpdate(params)
    if (validationError) {
      throw new Error(validationError)
    }

    return {
      ...pot,
      name: params.name !== undefined ? params.name : pot.name,
      target: params.target !== undefined ? params.target : pot.target,
      theme: params.theme !== undefined ? params.theme : pot.theme,
    }
  }

  /**
   * Validate pot creation parameters
   */
  validate(params: CreatePotParams | Pot): string | null {
    if ('id' in params) {
      // It's a Pot
      const pot = params as Pot

      if (!pot.name || !pot.name.trim()) {
        return 'Name is required'
      }

      if (pot.name.length > this.MAX_NAME_LENGTH) {
        return `Name must be no more than ${this.MAX_NAME_LENGTH} characters`
      }

      if (typeof pot.target !== 'number' || pot.target <= 0) {
        return 'Target amount must be a positive number'
      }

      if (typeof pot.total !== 'number' || pot.total < 0) {
        return 'Total amount cannot be negative'
      }

      if (!pot.theme) {
        return 'Theme is required'
      }

      return null
    } else {
      // It's CreatePotParams
      if (!params.name || !params.name.trim()) {
        return 'Name is required'
      }

      if (params.name.length > this.MAX_NAME_LENGTH) {
        return `Name must be no more than ${this.MAX_NAME_LENGTH} characters`
      }

      if (typeof params.target !== 'number' || params.target <= 0) {
        return 'Target amount must be a positive number'
      }

      if (
        params.initialAmount !== undefined &&
        (typeof params.initialAmount !== 'number' || params.initialAmount < 0)
      ) {
        return 'Initial amount cannot be negative'
      }

      if (!params.theme) {
        return 'Theme is required'
      }

      return null
    }
  }

  /**
   * Validate update parameters
   */
  private validateUpdate(params: UpdatePotParams): string | null {
    if (params.id === undefined) {
      return 'Pot ID is required for updates'
    }

    if (
      params.name !== undefined &&
      params.name.length > this.MAX_NAME_LENGTH
    ) {
      return `Name must be no more than ${this.MAX_NAME_LENGTH} characters`
    }

    if (
      params.target !== undefined &&
      (typeof params.target !== 'number' || params.target <= 0)
    ) {
      return 'Target amount must be a positive number'
    }

    return null
  }

  /**
   * Add money to a pot
   */
  addMoney(pot: Pot, params: PotMoneyTransactionParams): Pot {
    if (typeof params.amount !== 'number' || params.amount <= 0) {
      throw new Error('Amount must be a positive number')
    }

    return {
      ...pot,
      total: pot.total + params.amount,
    }
  }

  /**
   * Withdraw money from a pot
   */
  withdrawMoney(pot: Pot, params: PotMoneyTransactionParams): Pot {
    if (typeof params.amount !== 'number' || params.amount <= 0) {
      throw new Error('Amount must be a positive number')
    }

    if (pot.total < params.amount) {
      throw new Error('Insufficient funds in pot')
    }

    return {
      ...pot,
      total: pot.total - params.amount,
    }
  }
}

import { Command } from '../command.interface'
import { Pot } from '~/types/finance.types'
import { FormActionData } from '~/types/form.types'

// Command parameters
export interface CreatePotParams {
  name: string
  target: number
  theme: string
}

export interface UpdatePotParams {
  potId: string
  name: string
  target: number
  theme: string
  icon?: string
  color?: string
  addFunds?: number
}

export interface DeletePotParams {
  potId: string
}

export interface MoneyTransactionParams {
  potId: string
  amount: number
}

// Result types
export type PotCommandResult = FormActionData & {
  pot?: Pot
}

// Submit function type for abstraction
export type SubmitFunction = (
  formData: FormData,
  options: {
    method: 'get' | 'post' | 'put' | 'patch' | 'delete'
    action: string
  }
) => Promise<unknown>

/**
 * Base abstract pot command with common validation and submission logic
 */
export abstract class PotCommand<TParams>
  implements Command<TParams, PotCommandResult>
{
  constructor(protected submitFn: SubmitFunction) {}

  abstract execute(params: TParams): Promise<PotCommandResult>

  protected async submitForm(
    formData: FormData,
    action: string,
    method: 'get' | 'post' | 'put' | 'patch' | 'delete' = 'post'
  ): Promise<PotCommandResult> {
    const result = await this.submitFn(formData, {
      method,
      action,
    })

    return result as PotCommandResult
  }
}

/**
 * Command for creating a new pot
 */
export class CreatePotCommand extends PotCommand<CreatePotParams> {
  async execute(params: CreatePotParams): Promise<PotCommandResult> {
    try {
      const formData = new FormData()
      formData.append('intent', 'create')
      formData.append('name', params.name)
      formData.append('target', params.target.toString())
      formData.append('theme', params.theme)

      return this.submitForm(formData, '/pots')
    } catch (error) {
      if (error instanceof Error) {
        return { error: error.message }
      }
      return { error: 'An unknown error occurred' }
    }
  }
}

/**
 * Command for updating an existing pot
 */
export class UpdatePotCommand extends PotCommand<UpdatePotParams> {
  async execute(params: UpdatePotParams): Promise<PotCommandResult> {
    try {
      const formData = new FormData()
      formData.append('intent', 'update')
      formData.append('potId', params.potId)
      formData.append('name', params.name)
      formData.append('target', params.target.toString())
      formData.append('theme', params.theme)

      // Optional parameters
      if (params.icon) {
        formData.append('icon', params.icon)
      }
      if (params.color) {
        formData.append('color', params.color)
      }
      if (params.addFunds && params.addFunds > 0) {
        formData.append('addFunds', params.addFunds.toString())
      }

      return this.submitForm(formData, '/pots')
    } catch (error) {
      if (error instanceof Error) {
        return { error: error.message }
      }
      return { error: 'An unknown error occurred' }
    }
  }
}

/**
 * Command for deleting a pot
 */
export class DeletePotCommand extends PotCommand<DeletePotParams> {
  async execute(params: DeletePotParams): Promise<PotCommandResult> {
    try {
      const formData = new FormData()
      formData.append('intent', 'delete')
      formData.append('potId', params.potId)

      return this.submitForm(formData, '/pots')
    } catch (error) {
      if (error instanceof Error) {
        return { error: error.message }
      }
      return { error: 'An unknown error occurred' }
    }
  }
}

/**
 * Command for adding money to a pot
 */
export class AddMoneyCommand extends PotCommand<MoneyTransactionParams> {
  async execute(params: MoneyTransactionParams): Promise<PotCommandResult> {
    try {
      const formData = new FormData()
      formData.append('intent', 'add-money')
      formData.append('potId', params.potId)
      formData.append('amount', params.amount.toString())

      return this.submitForm(formData, '/pots')
    } catch (error) {
      if (error instanceof Error) {
        return { error: error.message }
      }
      return { error: 'An unknown error occurred' }
    }
  }
}

/**
 * Command for withdrawing money from a pot
 */
export class WithdrawMoneyCommand extends PotCommand<MoneyTransactionParams> {
  async execute(params: MoneyTransactionParams): Promise<PotCommandResult> {
    try {
      const formData = new FormData()
      formData.append('intent', 'withdraw')
      formData.append('potId', params.potId)
      formData.append('amount', params.amount.toString())

      return this.submitForm(formData, '/pots')
    } catch (error) {
      if (error instanceof Error) {
        return { error: error.message }
      }
      return { error: 'An unknown error occurred' }
    }
  }
}

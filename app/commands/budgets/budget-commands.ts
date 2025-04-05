import { Command } from '../command.interface'
import { Budget } from '~/types/finance.types'
import { FormActionData } from '~/types/form.types'

// Command parameters
export interface CreateBudgetParams {
  category: string
  maxAmount: number
  theme: string
}

export interface UpdateBudgetParams {
  budgetId: string
  category: string
  maxAmount: number
  theme: string
}

export interface DeleteBudgetParams {
  budgetId: string
}

// Result types
export type BudgetCommandResult = FormActionData & {
  budget?: Budget
  success?: boolean
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
 * Base abstract budget command with common validation and submission logic
 */
export abstract class BudgetCommand<TParams>
  implements Command<TParams, BudgetCommandResult>
{
  constructor(protected submitFn: SubmitFunction) {}

  abstract execute(params: TParams): Promise<BudgetCommandResult>

  protected async submitForm(
    formData: FormData,
    action: string,
    method: 'get' | 'post' | 'put' | 'patch' | 'delete' = 'post'
  ): Promise<BudgetCommandResult> {
    try {
      const result = await this.submitFn(formData, {
        method,
        action,
      })

      return result as BudgetCommandResult
    } catch (error) {
      // Handle submission errors gracefully
      return {
        error:
          error instanceof Error
            ? error.message
            : 'An unknown error occurred during submission',
      }
    }
  }
}

/**
 * Command for creating a new budget
 */
export class CreateBudgetCommand extends BudgetCommand<CreateBudgetParams> {
  private validateBudget(
    params: CreateBudgetParams,
    existingBudgets?: Budget[]
  ): void {
    if (existingBudgets) {
      const normalizedNewCategory = params.category.toLowerCase().trim()
      const isDuplicate = existingBudgets.some(
        (budget) =>
          budget.category.toLowerCase().trim() === normalizedNewCategory
      )

      if (isDuplicate) {
        throw new Error(
          `A budget for category "${params.category}" already exists`
        )
      }
    }
  }

  async execute(
    params: CreateBudgetParams,
    existingBudgets?: Budget[]
  ): Promise<BudgetCommandResult> {
    try {
      this.validateBudget(params, existingBudgets)

      const formData = new FormData()
      formData.append('intent', 'create')
      formData.append('category', params.category)
      formData.append('maxAmount', params.maxAmount.toString())
      formData.append('theme', params.theme)

      const result = await this.submitForm(formData, '/budgets')
      return result || { error: 'Failed to create budget' }
    } catch (error) {
      if (error instanceof Error) {
        return { error: error.message }
      }
      return { error: 'An unknown error occurred' }
    }
  }
}

/**
 * Command for updating an existing budget
 */
export class UpdateBudgetCommand extends BudgetCommand<UpdateBudgetParams> {
  private validateUpdate(
    params: UpdateBudgetParams,
    existingBudgets?: Budget[]
  ): void {
    if (existingBudgets) {
      const normalizedNewCategory = params.category.toLowerCase().trim()
      const currentBudget = existingBudgets.find(
        (b) => String(b.id) === params.budgetId
      )

      if (
        currentBudget &&
        normalizedNewCategory !== currentBudget.category.toLowerCase().trim()
      ) {
        const isDuplicate = existingBudgets.some(
          (budget) =>
            budget.category.toLowerCase().trim() === normalizedNewCategory &&
            String(budget.id) !== params.budgetId
        )

        if (isDuplicate) {
          throw new Error(
            `A budget for category "${params.category}" already exists`
          )
        }
      }
    }
  }

  async execute(
    params: UpdateBudgetParams,
    existingBudgets?: Budget[]
  ): Promise<BudgetCommandResult> {
    try {
      this.validateUpdate(params, existingBudgets)

      const formData = new FormData()
      formData.append('intent', 'update')
      formData.append('budgetId', params.budgetId)
      formData.append('category', params.category)
      formData.append('maxAmount', params.maxAmount.toString())
      formData.append('theme', params.theme)

      const result = await this.submitForm(formData, '/budgets')
      return result || { error: 'Failed to update budget' }
    } catch (error) {
      if (error instanceof Error) {
        return { error: error.message }
      }
      return { error: 'An unknown error occurred' }
    }
  }
}

/**
 * Command for deleting a budget
 */
export class DeleteBudgetCommand extends BudgetCommand<DeleteBudgetParams> {
  async execute(params: DeleteBudgetParams): Promise<BudgetCommandResult> {
    try {
      const formData = new FormData()
      formData.append('intent', 'delete')
      formData.append('budgetId', params.budgetId)

      const result = await this.submitForm(formData, '/budgets')

      // Properly handle successful deletion
      if (result && typeof result === 'object' && 'success' in result) {
        return result
      }

      // If we don't have a specific success marker but no error, assume success
      if (result && (!result || !('error' in result))) {
        return { success: true }
      }

      return result || { error: 'Failed to delete budget', success: false }
    } catch (error) {
      if (error instanceof Error) {
        return { error: error.message, success: false }
      }
      return { error: 'An unknown error occurred', success: false }
    }
  }
}

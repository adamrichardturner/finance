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
  validateBudget(params: CreateBudgetParams, existingBudgets?: Budget[]): void {
    // Validate the budget name is not empty
    if (!params.category.trim()) {
      throw new Error('Budget category cannot be empty')
    }

    // Validate that the category is not "Income"
    if (params.category.toLowerCase() === 'income') {
      throw new Error('Income cannot be used as a budget category')
    }

    // Validate the max amount is positive
    if (params.maxAmount <= 0) {
      throw new Error('Maximum amount must be positive')
    }

    // Validate the max amount is below PostgreSQL numeric limit (precision 10, scale 2)
    const MAX_BUDGET_AMOUNT = 99999999.99
    if (params.maxAmount > MAX_BUDGET_AMOUNT) {
      throw new Error(
        `Maximum amount cannot exceed ${MAX_BUDGET_AMOUNT.toLocaleString('en-GB')}`
      )
    }

    // Check if a budget with this category already exists
    if (existingBudgets && existingBudgets.length > 0) {
      const existingBudget = existingBudgets.find(
        (budget) =>
          budget.category.toLowerCase().trim() ===
          params.category.toLowerCase().trim()
      )
      if (existingBudget) {
        throw new Error(
          `A budget for "${params.category}" already exists. Please choose a different category.`
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
      return result || { success: true }
    } catch (error) {
      if (error instanceof Error) {
        return { error: error.message, success: false }
      }
      return { error: 'An unknown error occurred', success: false }
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
      return result || { success: true }
    } catch (error) {
      if (error instanceof Error) {
        return { error: error.message, success: false }
      }
      return { error: 'An unknown error occurred', success: false }
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
      return result || { success: true }
    } catch (error) {
      if (error instanceof Error) {
        return { error: error.message, success: false }
      }
      return { error: 'An unknown error occurred', success: false }
    }
  }
}

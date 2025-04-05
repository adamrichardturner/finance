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
    const result = await this.submitFn(formData, {
      method,
      action,
    })

    return result as BudgetCommandResult
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

      return this.submitForm(formData, '/budgets')
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

      return this.submitForm(formData, '/budgets')
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
    const formData = new FormData()
    formData.append('intent', 'delete')
    formData.append('budgetId', params.budgetId)

    return this.submitForm(formData, '/budgets')
  }
}

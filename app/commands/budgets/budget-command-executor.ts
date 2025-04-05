import {
  CreateBudgetCommand,
  UpdateBudgetCommand,
  DeleteBudgetCommand,
  BudgetCommandResult,
  CreateBudgetParams,
  UpdateBudgetParams,
  DeleteBudgetParams,
  SubmitFunction,
} from './budget-commands'
import { Budget } from '~/types/finance.types'

/**
 * BudgetCommandExecutor provides a unified interface for executing budget commands
 * while maintaining execution state and history
 */
export class BudgetCommandExecutor {
  private createCommand: CreateBudgetCommand
  private updateCommand: UpdateBudgetCommand
  private deleteCommand: DeleteBudgetCommand
  private commandHistory: Array<{ command: string; params: any }> = []
  private isExecuting = false

  constructor(submitFn: SubmitFunction) {
    this.createCommand = new CreateBudgetCommand(submitFn)
    this.updateCommand = new UpdateBudgetCommand(submitFn)
    this.deleteCommand = new DeleteBudgetCommand(submitFn)
  }

  /**
   * Create a new budget
   */
  async create(
    params: CreateBudgetParams,
    existingBudgets?: Budget[]
  ): Promise<BudgetCommandResult> {
    this.isExecuting = true
    try {
      const result = await this.createCommand.execute(params, existingBudgets)
      if (!result.error) {
        this.commandHistory.push({ command: 'create', params })
      }
      return result
    } finally {
      this.isExecuting = false
    }
  }

  /**
   * Update an existing budget
   */
  async update(
    params: UpdateBudgetParams,
    existingBudgets?: Budget[]
  ): Promise<BudgetCommandResult> {
    this.isExecuting = true
    try {
      const result = await this.updateCommand.execute(params, existingBudgets)
      if (!result.error) {
        this.commandHistory.push({ command: 'update', params })
      }
      return result
    } finally {
      this.isExecuting = false
    }
  }

  /**
   * Delete a budget
   */
  async delete(params: DeleteBudgetParams): Promise<BudgetCommandResult> {
    this.isExecuting = true
    try {
      const result = await this.deleteCommand.execute(params)
      if (!result.error) {
        this.commandHistory.push({ command: 'delete', params })
      }
      return result
    } finally {
      this.isExecuting = false
    }
  }

  /**
   * Check if a command is currently executing
   */
  get isPending(): boolean {
    return this.isExecuting
  }

  /**
   * Get command history for debugging or undo functionality
   */
  getCommandHistory(): Array<{ command: string; params: any }> {
    return [...this.commandHistory]
  }

  /**
   * Clear command history
   */
  clearHistory(): void {
    this.commandHistory = []
  }
}

import {
  CreatePotCommand,
  UpdatePotCommand,
  DeletePotCommand,
  AddMoneyCommand,
  WithdrawMoneyCommand,
  PotCommandResult,
  CreatePotParams,
  UpdatePotParams,
  DeletePotParams,
  MoneyTransactionParams,
  SubmitFunction,
} from './pot-commands'

// Define a Command history record type
interface CommandHistoryRecord {
  command: string
  params:
    | CreatePotParams
    | UpdatePotParams
    | DeletePotParams
    | MoneyTransactionParams
}

/**
 * PotCommandExecutor provides a unified interface for executing pot commands
 * while maintaining execution state and history
 */
export class PotCommandExecutor {
  private createCommand: CreatePotCommand
  private updateCommand: UpdatePotCommand
  private deleteCommand: DeletePotCommand
  private addMoneyCommand: AddMoneyCommand
  private withdrawCommand: WithdrawMoneyCommand
  private commandHistory: CommandHistoryRecord[] = []
  private isExecuting = false

  constructor(submitFn: SubmitFunction) {
    this.createCommand = new CreatePotCommand(submitFn)
    this.updateCommand = new UpdatePotCommand(submitFn)
    this.deleteCommand = new DeletePotCommand(submitFn)
    this.addMoneyCommand = new AddMoneyCommand(submitFn)
    this.withdrawCommand = new WithdrawMoneyCommand(submitFn)
  }

  /**
   * Create a new pot
   */
  async create(params: CreatePotParams): Promise<PotCommandResult> {
    this.isExecuting = true
    try {
      const result = await this.createCommand.execute(params)
      if (!result.error) {
        this.commandHistory.push({ command: 'create', params })
      }
      return result
    } finally {
      this.isExecuting = false
    }
  }

  /**
   * Update an existing pot
   */
  async update(params: UpdatePotParams): Promise<PotCommandResult> {
    this.isExecuting = true
    try {
      const result = await this.updateCommand.execute(params)
      if (!result.error) {
        this.commandHistory.push({ command: 'update', params })
      }
      return result
    } finally {
      this.isExecuting = false
    }
  }

  /**
   * Delete a pot
   */
  async delete(params: DeletePotParams): Promise<PotCommandResult> {
    this.isExecuting = true
    try {
      // Validate the pot ID
      if (!params.potId) {
        return { error: 'Pot ID is required' }
      }

      const result = await this.deleteCommand.execute(params)

      // The result is already handled by the command's execute method
      if (!result.error) {
        this.commandHistory.push({ command: 'delete', params })
      }

      return result
    } catch (error) {
      // This should not happen since the command's execute method handles errors
      return { error: 'Failed to delete pot' }
    } finally {
      this.isExecuting = false
    }
  }

  /**
   * Add money to a pot
   */
  async addMoney(params: MoneyTransactionParams): Promise<PotCommandResult> {
    this.isExecuting = true
    try {
      // Validate inputs
      if (!params.potId) {
        return { error: 'Pot ID is required' }
      }

      if (typeof params.amount !== 'number' || params.amount <= 0) {
        return { error: 'Amount must be a positive number' }
      }

      const result = await this.addMoneyCommand.execute(params)
      if (!result.error) {
        this.commandHistory.push({ command: 'addMoney', params })
      }
      return result
    } catch (error) {
      if (error instanceof Error) {
        return { error: error.message }
      }
      return { error: 'An unknown error occurred while adding money' }
    } finally {
      this.isExecuting = false
    }
  }

  /**
   * Withdraw money from a pot
   */
  async withdraw(params: MoneyTransactionParams): Promise<PotCommandResult> {
    this.isExecuting = true
    try {
      // Validate inputs
      if (!params.potId) {
        return { error: 'Pot ID is required' }
      }

      if (typeof params.amount !== 'number' || params.amount <= 0) {
        return { error: 'Amount must be a positive number' }
      }

      const result = await this.withdrawCommand.execute(params)
      if (!result.error) {
        this.commandHistory.push({ command: 'withdraw', params })
      }
      return result
    } catch (error) {
      if (error instanceof Error) {
        return { error: error.message }
      }
      return { error: 'An unknown error occurred while withdrawing money' }
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
  getCommandHistory(): CommandHistoryRecord[] {
    return [...this.commandHistory]
  }

  /**
   * Clear command history
   */
  clearHistory(): void {
    this.commandHistory = []
  }
}

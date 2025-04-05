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
   * Add money to a pot
   */
  async addMoney(params: MoneyTransactionParams): Promise<PotCommandResult> {
    this.isExecuting = true
    try {
      const result = await this.addMoneyCommand.execute(params)
      if (!result.error) {
        this.commandHistory.push({ command: 'addMoney', params })
      }
      return result
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
      const result = await this.withdrawCommand.execute(params)
      if (!result.error) {
        this.commandHistory.push({ command: 'withdraw', params })
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

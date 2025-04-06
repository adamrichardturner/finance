export interface Command<TParams, TResult> {
  execute(params: TParams): Promise<TResult>
}

/**
 * Commands that can be undone implement this interface
 */
export interface UndoableCommand<TParams, TResult>
  extends Command<TParams, TResult> {
  undo(): Promise<void>
}

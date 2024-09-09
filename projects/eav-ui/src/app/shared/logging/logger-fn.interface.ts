
/**
 * Interface for a function-logger.
 * Must be an interface, because often the logger could be blank/empty and not do anything,
 * so there are multiple implementations.
 */
export interface LoggerFn {
  // TODO: NOT SURE if we should keep this, as the 'a' does almost the same thing...
  values(data: Record<string, unknown>, intro?: string): void;
  a(message: string, data?: Record<string, unknown>): void;
  r<TResult>(result: TResult, message?: string, showData?: boolean): TResult;
  rSilent<TResult>(result: TResult, message?: string): TResult;
  rNull(message?: string): null;
  end(message?: string, data?: Record<string, unknown>): void;

  rTrue(message?: string): boolean;
  rFalse(message?: string): boolean;
}

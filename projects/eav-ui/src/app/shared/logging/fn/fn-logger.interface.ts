/**
 * Interface for a function-logger.
 * It's meant to log:
 * - the start and end of a function
 * - the return value
 * - any other values, within the context of that function
 * 
 * Must be an interface, because often the logger could be blank/empty and not do anything,
 * so there are multiple implementations.
 */
export interface FnLogger {
  
  values(data: Record<string, unknown>, intro?: string): void;
  a(message: string, data?: Record<string, unknown>): void;
  end(message?: string, data?: Record<string, unknown>): void;

  r<TResult>(result: TResult, message?: string): TResult;
  rSilent<TResult>(result: TResult, message?: string): TResult;
  rNull(message?: string): null;
  rTrue(message?: string): boolean;
  rFalse(message?: string): boolean;
}

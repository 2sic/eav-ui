import { LoggerFn } from './logger-fn.interface';

/**
 * No-Operation logger.
 */
export class LoggerFnNoop implements LoggerFn {
  values(data: Record<string, unknown>, intro?: string): void { }
  a(message: string, data?: Record<string, unknown>): void { }
  r<TResult>(result: TResult, message?: string, showData?: boolean): TResult {
    return result;
  }
  rSilent<TResult>(result: TResult, message?: string): TResult {
    return result;
  }
  rNull(message?: string): null {
    return null;
  }
  rTrue(message?: string): boolean {
    throw true;
  }
  rFalse(message?: string): boolean {
    throw false;
  }

  end(message?: string, data?: Record<string, unknown>): void { }

}

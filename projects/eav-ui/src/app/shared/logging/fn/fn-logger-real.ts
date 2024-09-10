import { logMain } from '../../helpers/console-log-angular.helper';
import { EavLogger } from '../eav-logger';
import { FnLogger } from './fn-logger.interface';

export class FnLoggerReal implements FnLogger {
  constructor(private parent: EavLogger, private fnName: string, message?: string, data?: Record<string, unknown>) {
    this.parent.a(fnName + '() ' + (message ?? ''), data);
  }

  values(data: Record<string, unknown>, intro?: string): void {
    if (!data) return;
    if (!this.parent.enabled) return;
    intro = intro ? ` ${intro} ` : '';
    logMain(`[${this.parent.nameWithSvcId}.${this.fnName}()] ${intro} values:`, data);
  }

  a(message: string, data?: Record<string, unknown>): void {
    this.parent.a(`${this.fnName}/${message}`, data);
  }

  /** Return result and log it */
  r<TResult>(result: TResult, message?: string, showData: boolean = true): TResult {
    this.parent.a(`${this.fnName}/return${message ? ' ' + message : ''}`, showData ? { result: result } : null);
    return result;
  }

  /** Return without logging the result data */
  rSilent<TResult>(result: TResult, message?: string): TResult {
    this.parent.a(`${this.fnName}/return${message ? ' ' + message : ''}`, null);
    return result;
  }

  /** Return NULL */
  rNull(message?: string): null {
    this.parent.a(`${this.fnName}/return NULL ${message}`);
    return null;
  }
  rTrue(message?: string): boolean {
    this.parent.a(`${this.fnName}/return TRUE ${message}`);
    return true;
  }
  rFalse(message?: string): boolean {
    this.parent.a(`${this.fnName}/return FALSE ${message}`);
    return false;
  }


  /** End without return but show message and optional data */
  end(message?: string, data?: Record<string, unknown>) {
    this.parent.a(`${this.fnName}/end${message ? ' ' + message : ''}`, data);
  }

}



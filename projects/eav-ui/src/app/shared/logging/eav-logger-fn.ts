import { logMain } from '../helpers/console-log-angular.helper';
import { EavLogger } from './eav-logger';

export class EavLoggerFn {
  constructor(private parent: EavLogger, private fnName: string, message?: string, data?: Record<string, unknown>) {
    this.parent.a(fnName + '() ' + message, data);
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

  /** Return */
  r<TResult>(value: TResult, message?: string): TResult {
    this.parent.a(`${this.fnName}/return${message ? ' ' + message : ''}`, {result: value});
    return value;
  }

  rNull(message?: string): null {
    this.parent.a(`${this.fnName}/return NULL ${message}`);
    return null;
  }
}
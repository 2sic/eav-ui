import { EavLogger } from './eav-logger';

export class EavLoggerFn {
  constructor(private parent: EavLogger, private fnName: string, message?: string, data?: Record<string, unknown>) {
    this.parent.a(fnName + '() ' + message, [data]);
  }

  v(name: string, value: unknown, intro?: string): void {
    this.parent.val(`${this.fnName}/${intro ? intro + ' ' : ''}${name}`, value);
  }

  values(data: Record<string, unknown>, intro?: string): void {
    if (!data) return;
    // log each key and value
    Object.keys(data).forEach(key => this.v(key, data[key], intro));
  }

  a(message: string, data?: Record<string, unknown>): void {
    this.parent.a(`${this.fnName}/${message}`, [data]);
  }

  /** Return */
  r<TResult>(value: TResult, message?: string): TResult {
    this.parent.a(`${this.fnName}/return${message ? ' ' + message : ''}`, [value]);
    return value;
  }

  rNull(message?: string): null {
    this.parent.a(`${this.fnName}/return NULL ${message}`, null);
    return null;
  }
}
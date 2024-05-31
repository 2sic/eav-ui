import { EavLogger } from './eav-logger';

export class EavLoggerFn<T> {
  constructor(private parent: EavLogger, name: string, message?: string, data?: any[]) {
    this.parent.a(name + '() ' + message, data);
  }

  v(name: string, value: unknown): void {
    this.parent.val(name, value);
  }

  vs(data: Record<string, unknown>): void {
    if (!data) return;
    // log each key and value
    Object.keys(data).forEach(key => this.parent.val(`value of ${key}`, data[key]));
  }

  a(message: string, data?: unknown[]): void {
    this.parent.a(message, data);
  }

  /** Return */
  r(value: T, message?: string): T {
    this.parent.a(`return ${message}`, [value]);
    return value;
  }

  rNull(message?: string): null {
    this.parent.a(`return NULL ${message}`, null);
    return null;
  }
}
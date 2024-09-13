import { consoleLogObject } from '../output-console';
import { FnLogger } from './fn-logger.interface';
import { ClassLogger, RecordOrGenerator } from '../logger.interface';

export class FnLoggerReal implements FnLogger {
  
  constructor(private parent: ClassLogger, private fnName: string, message?: string, data?: RecordOrGenerator) {
    this.#a(message, data);
  }

  get enabled() { return this.parent.enabled; };

  /** Internal helper to really log - if enabled */
  #a(message: string, data?: RecordOrGenerator, autoPad: boolean = true): void {
    if (!this.parent.enabled) return;
    message ??= '';
    if (message && autoPad) message = ` ${message}`;
    data = typeof data === 'function' ? data() : data;
    consoleLogObject({ message: `${this.parent.nameWithSvcId}.${this.fnName}()${message}`, data });
  }

  a(message: string, data?: Record<string, unknown>): void {
    this.#a('/' + message, data, false);
  }

  values(data: Record<string, unknown>, intro?: string): void {
    if (!data) return;
    if (!this.parent.enabled) return;
    intro = intro ? ` ${intro} ` : '';
    this.#a('/values' + intro, data, false);
  }

  /** Return result and log it */
  r<TResult>(result: TResult, message?: string): TResult {
    this.#a('/return' + (message ? ' ' + message : ''), { result: result }, false);
    return result;
  }

  /** Return without logging the result data */
  rSilent<TResult>(result: TResult, message?: string): TResult {
    this.#a('/return' + (message ? ' ' + message : ''), null, false);
    return result;
  }

  /** Return NULL */
  rNull(message?: string): null {
    this.#a('/return NULL' + (message ? ' ' + message : ''), null, false);
    return null;
  }
  rTrue(message?: string): boolean {
    this.#a('/return TRUE' + (message ? ' ' + message : ''), null, false);
    return true;
  }
  rFalse(message?: string): boolean {
    this.#a('/return FALSE' + (message ? ' ' + message : ''), null, false);
    return false;
  }


  /** End without return but show message and optional data */
  end(message?: string, data?: Record<string, unknown>) {
    this.#a('/end' + (message ? ' ' + message : ''), data, false);
  }

}



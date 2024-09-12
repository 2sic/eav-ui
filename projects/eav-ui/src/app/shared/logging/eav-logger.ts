import { consoleLogObject } from './output-console';
import { FnLoggerReal } from './fn/fn-logger-real';
import { FnLogger } from './fn/fn-logger.interface';
import { FnLoggerNoOp } from './fn/fn-logger-noop';
import { LogManager } from './log-manager';
import { LogSpecs } from './log-specs';
import { RxTapDebug } from './rx-debug-dbg';
import { environment } from '../../../environments/environment';

/**
 * TODO:
 * - STOP using this directly, but instead use the classLog function
 * - Then rename to ClassLogger
 * - ...and move to sub-folder
 */
export class EavLogger<TSpecs extends unknown = any> {
  /** Special random ID to identify a specific service and detect reuse or separate instances  */
  svcId = Math.random().toString(36).substring(2, 5);

  /** Name to be used in console logs etc. */
  name: string;

  /** Enabled state, combination of own enabled value + production-build info */
  get enabled() { return this.#enabled; }
  #enabled: boolean;
  #setEnabled(value: boolean) {
    this.#enabled = value && !environment.production;
  }


  enableChildren: boolean;

  /** Additional specs for logging just parts of the data */
  specs: TSpecs;

  constructor(logSpecs: LogSpecs<TSpecs>);
  constructor(name: string, enabled?: boolean, enableChildren?: boolean);
  constructor(name: LogSpecs<TSpecs> | string, enabled?: boolean, enableChildren?: boolean) {
    const initialSpecs: LogSpecs<TSpecs> = typeof name === 'object'
      ? name
      : {
          name: name,
          enabled: enabled ?? false,
          enableChildren: enableChildren,
          specs: {} as TSpecs,
        } satisfies LogSpecs<TSpecs>;

    const mainSpecs = LogManager.getSpecs(initialSpecs);

    this.#rename(mainSpecs.name);
    this.#setEnabled(mainSpecs.enabled);
    this.enableChildren = mainSpecs.enableChildren ?? false;
    this.specs = mainSpecs.specs;
  }

  #rename(name: string) {
    this.name = name;
    this.nameWithSvcId = `${name}-${this.svcId}`;
  }

  public extendName(addOn: string): this {
    this.#rename(`${this.name}${addOn}`);
    return this;
  }

  public nameWithSvcId: string;

  public inherit(parent: EavLogger<TSpecs>) {
    // if already enabled, don't do anything; inherit can only activate it
    if (this.enabled)
      return;

    this.#setEnabled(parent.enabled);

    // if this results in log enabled, inform the console.
    // otherwise it's really hard to find out why a log is on
    if (parent.enabled)
      this.a(`Enabled: Inheriting log settings from parent ${parent.nameWithSvcId}`);
  }

  public forceEnable(enabled: boolean | null) {
    if (enabled == null || this.enabled) return;
    if (enabled) this.a('Enabled: Forced to enable log');
    this.#setEnabled(enabled);
  }

  /** Internal helper to really log - if enabled */
  #a(message: string, data?: Record<string, unknown>, autoPad: boolean = true): void {
    if (!this.enabled) return;
    message ??= '';
    if (message && autoPad) message = ` ${message}`;
    consoleLogObject({ message: `${this.nameWithSvcId}${message}`, data });
  }

  /**
   * Special 'a' = add log helper to better diagnose what is happening
   */
  a(message: string, data?: Record<string, unknown>): void {
    this.#a(message, data);
    if (!this.enabled) return;
  }

  /** Create a special logger for rx logging */
  rxTap(name: string, { enabled = true, jsonify = true }: { enabled?: boolean; jsonify?: boolean; } = { enabled: true, jsonify: true }) {
    return new RxTapDebug(this as EavLogger<unknown>, name, enabled, jsonify);
  }

  /**
   * 
   * TODO: @2pp - refactor all uses to just use the fnCond method?
   * 
   * @param name 
   * @param data 
   * @param message 
   * @returns 
   */
  fn(name: string, data?: Record<string, unknown>, message?: string): FnLogger {
    return new FnLoggerReal(this as EavLogger, name, message, data);
  }

  /**
   * Create a logger function that will only log if the condition is true
   */
  fnCond(condition: boolean, name: string, data?: Record<string, unknown>, message?: string): FnLogger {
    // create real logger if condition is true, or if this logger is disabled anyhow
    return condition || !this.enabled
      ? this.fn(name, data, message)
      : new FnLoggerNoOp();
  }

  /**
   * Create a logger function that will only log if the condition is true.
   * The condition must come from the specs object.
   * 
   * TODO: @2pp - refactor all uses to just use the fnCond method?
   */
  fnIf(key: BooleanKeys<TSpecs> & string, data?: Record<string, unknown>, message?: string): FnLogger {
    // create real logger if condition is true, or if this logger is disabled anyhow
    return this.enabled && this.#ifInSpecs(key)
      ? this.fn(key, data, message)
      : new FnLoggerNoOp();
  }

  fnIfInList(key: BooleanKeys<TSpecs> & string, list: StringArrayKeys<TSpecs>, subKey: string, data?: Record<string, unknown>, message?: string): FnLogger {
    return this.enabled && this.#ifInSpecs(key) && this.#ifInSpecsList(list, subKey)
      ? this.fn(key, data, message)
      : new FnLoggerNoOp();
  }

  /** Helper to check if a key is in the specs and is true, or 'all' is true */
  #ifInSpecs(key: BooleanKeys<TSpecs> & string): boolean {
    return this.specs && !!(this.specs[key] || (this.specs as { all: boolean })['all']);
  }

  #ifInSpecsList(list: StringArrayKeys<TSpecs>, subKey: string): boolean {
    const keys = this.specs?.[list] as string[];
    return keys && (keys.includes(subKey) || keys.includes('*'));
  }
}

/** 
 * Helper to only allow boolean keys in the specs object.
 * https://stackoverflow.com/questions/50851263/how-do-i-require-a-keyof-to-be-for-a-property-of-a-specific-type
*/
type BooleanKeys<T> = { [k in keyof T]: T[k] extends boolean ? k : never }[keyof T];
type BooleanSpecs<T> = { [k in BooleanKeys<T>]: boolean };

type StringArrayKeys<T> = { [k in keyof T]: T[k] extends string[] ? k : never }[keyof T];
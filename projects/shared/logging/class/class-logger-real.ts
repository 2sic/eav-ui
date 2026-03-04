import { environment } from '../../environments/environment';
import { FnLoggerNoOp } from '../fn/fn-logger-noop';
import { FnLoggerReal } from '../fn/fn-logger-real';
import { FnLogger } from '../fn/fn-logger.interface';
import { LogSpecs } from '../log-specs';
import { consoleLogObject } from '../output-console';
import { BooleanKeys, ClassLogger, RecordOrGenerator, StringArrayKeys } from './class-logger';

/**
 * TODO:
 * - STOP using this directly, but instead use the classLog function
 * - Then rename to ClassLogger
 * - ...and move to sub-folder
 */
export class ClassLoggerReal<TSpecs extends unknown = any> implements ClassLogger<TSpecs> {
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

  constructor(logSpecs: LogSpecs<TSpecs>) {
    this.#rename(logSpecs.name);
    // Bypass the default setEnabled, as we want to be able to override in production
    this.#enabled = logSpecs.enabled;
    this.enableChildren = logSpecs.enableChildren ?? false;
    this.specs = logSpecs.specs;
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

  public inherit(parent: ClassLogger) {
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
  #a(message: string, data?: RecordOrGenerator, autoPad: boolean = true): void {
    if (!this.enabled) return;
    message ??= '';
    if (message && autoPad) message = ` ${message}`;
    data = typeof data === 'function' ? data() : data;
    consoleLogObject({ message: `${this.nameWithSvcId}${message}`, data });
  }

  /**
   * Special 'a' = add log helper to better diagnose what is happening
   */
  a(message: string, data?: RecordOrGenerator): void {
    this.#a(message, data);
  }

  aIf(key: BooleanKeys<TSpecs> & string, data?: RecordOrGenerator, message?: string): void {
    if (this.enabled && this.#ifInSpecs(key))
      this.#a(message, data);
  }

  aIfInList(list: StringArrayKeys<TSpecs>, subKey: string, data?: RecordOrGenerator, message?: string): void {
    if (this.enabled && this.#ifInSpecsList(list, subKey))
      this.#a(message, data);
  }

  /**
   * 
   * TODO: @2pp - refactor all uses to just use the fnIf method? - but WAIT till delegate by 2dm
   * 
   * @param name 
   * @param data 
   * @param message 
   * @returns 
   */
  fn(name: string, data?: RecordOrGenerator, message?: string): FnLogger {
    return new FnLoggerReal(this as ClassLogger, name, message, data);
  }

  /**
   * Create a logger function that will only log if the condition is true
   */
  fnCond(condition: boolean, name: string, data?: RecordOrGenerator, message?: string): FnLogger {
    // create real logger if condition is true, or if this logger is disabled anyhow
    return condition || !this.enabled
      ? this.fn(name, data, message)
      : new FnLoggerNoOp();
  }

  /**
   * Create a logger function that will only log if the condition is true.
   * The condition must come from the specs object.
   */
  fnIf(key: BooleanKeys<TSpecs> & string, data?: RecordOrGenerator, message?: string): FnLogger {
    // create real logger if condition is true, or if this logger is disabled anyhow
    return this.enabled && this.#ifInSpecs(key)
      ? this.fn(key, data, message)
      : new FnLoggerNoOp();
  }

  fnIfInList(key: BooleanKeys<TSpecs> & string, listName: StringArrayKeys<TSpecs>, value: string, data?: RecordOrGenerator, message?: string): FnLogger {
    return this.enabled && this.#ifInSpecs(key) && this.#ifInSpecsList(listName, value)
      ? this.fn(`${key}[${value}]`, data, message)
      : new FnLoggerNoOp();
  }

  fnIfInFields(key: BooleanKeys<TSpecs> & string, value: string, data?: RecordOrGenerator, message?: string): FnLogger {
    return this.fnIfInList(key, 'fields' as StringArrayKeys<TSpecs>, value, data, message);
  }

  /** Helper to check if a key is in the specs and is true, or 'all' is true */
  #ifInSpecs(key: BooleanKeys<TSpecs> & string): boolean {
    return this.specs && !!(this.specs[key] || (this.specs as { all: boolean })['all']);
  }

  /** Check if tha property on the logSpecs contains the subKey or a wildcard '*' */
  #ifInSpecsList(listName: StringArrayKeys<TSpecs>, subKey: string): boolean {
    const keys = this.specs?.[listName] as string[] ?? [];
    return keys && (keys.includes(subKey) || keys.includes('*'));
  }
}

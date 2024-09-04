import { LogSpecs } from './log-specs';
import { StateManagerSession, StateManager } from '../user/state-manager';

let logManager: LogManager;
const storePrefix = 'logSpecs';

export class LogManager {
  /**
   * Main external function to get the specs for activating a logger.
   * 
   * Goal are
   * - to register the logger - so the UI can show that it exists.
   * - to get any alternate specs for the logger, in case the UI changes the settings.
   * 
   * @param specs initial / default specs according to code
   * @returns 
   */
  static getSpecs<T>(specs: LogSpecs<T>): LogSpecs<T> {
    const lm = LogManager.singleton();

    if (lm.debug)
      debugger;

    // Check if we already did all the merge etc.
    // and should just return the existing specs
    const existing = lm.cache[specs.name] as LogSpecs<T>;
    if (existing) return existing;
    
    // Check if we have a configured version of the specs
    const configured = lm.state.cache[specs.name] as LogSpecs<T>;

    const merged: LogSpecs<T> = {
      enabled: false,
      ...specs,
      ...configured,
    };
    lm.cache[specs.name] = merged;

    return merged;
  }

  /** Get access to the singleton log manager */
  static singleton(): LogManager {
    if (logManager) return logManager;

    // Since the code for the logger could be in multiple bundles, we must ensure we only have one instance
    const win: { logManager: LogManager } = window as any;

    if (win.logManager)
      return logManager = win.logManager;
    
    win.logManager = logManager = new LogManager();
    return logManager;
  }

  /** Ensures that this class can only be constructed here */
  private constructor() { }

  private cache: Record<string, LogSpecs<unknown>> = {};

  private state: StateManager<LogSpecs<unknown>> = new StateManagerSession(storePrefix);

  debug: false;

  /** Get all specs */
  get allSpecs() { return this.cache; }

  get allConfigured() { return this.state.cache; }

  get specsOfConfigured() {
    const stateCache = this.state.cache;
    return Object.keys(stateCache).map(k => this.cache[k] || stateCache[k]);
  }

  configure<T>(specs: LogSpecs<T>) {
    delete this.cache[specs.name];
    this.state.add(specs.name, specs);
  }

  toggle(name: string): boolean;
  toggle(name: string, state: boolean): boolean;
  toggle(name: string, state?: boolean): boolean {
    const configured = this.state.cache[name];
    const enabled = state ?? !(configured?.enabled);
    const newConfig = { ...configured, name, enabled, };
    this.configure(newConfig);
    return state;
  }

  reset() {
    this.state.reset();
    this.cache = {};
  }
}


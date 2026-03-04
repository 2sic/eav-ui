import isEqual from 'lodash-es/isEqual';
import { StateManager, StateManagerSession } from '../../eav-ui/src/app/shared/user/state-manager';
import { LogSpecs } from './log-specs';

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

    if (lm.debug) debugger;

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

    if (win.logManager) return (logManager = win.logManager);

    win.logManager = logManager = new LogManager();
    return logManager;
  }

  /** Ensures that this class can only be constructed here */
  private constructor() {}

  private cache: Record<string, LogSpecs<unknown>> = {};

  public state: StateManager<LogSpecs<unknown>> = new StateManagerSession(
    storePrefix
  );

  debug: false;

  /** Updates the in-memory specs and saves them to the state */
  updateSpecs(updatedSpecs: Record<string, LogSpecs<unknown>>): void {
    // Iterate through the updated specs to ensure all changes are reflected
    Object.keys(updatedSpecs).forEach((name) => {
      const existing = this.cache[name];

      // Only update if the log specs are different
      if (!isEqual(existing?.specs, updatedSpecs[name].specs)) {
        this.cache[name] = updatedSpecs[name];
        this.state.add(name, updatedSpecs[name]);
      }
    });
  }

  /** Get all specs */
  get allSpecs() {
    return this.cache;
  }

  get allConfigured() {
    return this.state.cache;
  }

  /** Merged version of all configured and cached specs */
  get mergeAllSpecs() {
    const mergedSpecs: Record<string, LogSpecs<unknown>> = { ...this.cache };

    Object.keys(this.state.cache).forEach((name) => {
      mergedSpecs[name] = {
        ...mergedSpecs[name],
        ...this.state.cache[name],
      };
    });

    // Removes all user Configs, because they are saved with the logs
    Object.keys(mergedSpecs).forEach((key) => {
      if (key.startsWith(storePrefix)) {
        delete mergedSpecs[key];
      }
    });
    return mergedSpecs;
  }

  get specsOfConfigured() {
    const stateCache = this.state.cache;
    return Object.keys(stateCache).map((k) => this.cache[k] || stateCache[k]);
  }

  configure<T>(specs: LogSpecs<T>) {
    delete this.cache[specs.name];
    this.state.add(specs.name, specs);
  }

  toggle(name: string): boolean;
  toggle(name: string, state: boolean): boolean;
  toggle(name: string, state?: boolean): boolean {
    const cached = this.cache[name];
    const configured = this.state.cache[name];
    const enabled = state ?? !configured?.enabled;
    const specs = configured?.specs || cached?.specs || {};
    const newConfig = {
      name,
      enabled,
      specs,
    };
    this.configure(newConfig);
    return state;
  }
}

import { LogSpecs } from '../logging/log-specs';

const logThis = true;
const separator = ":";
export class StateManager<T> {

  protected constructor(private storage: Storage, private prefix: string, private configName?: string) {
    this.#storeKey = this.prefix + (this.configName ? `${separator}${this.configName}` : '');
  }
  #storeKey: string;

  /** Get the current list of these settings */
  get cache(): Record<string, T> {
    return (this.#cache ??= this.#load() ?? {}) as unknown as Record<string, T>;
  }
  #cache: Record<string, unknown>;

  get<TValue>(name: string): TValue {
    return this.cache[name] as unknown as TValue;
  }

  add<TValue>(name: string, specs: TValue) {
    this.cache[name] = specs as unknown as T;
    this.#save(this.cache);
  }

  remove(name: string) {
    delete this.cache[name];
    this.#save(this.cache);
  }

  reset() {
    this.#save(this.#cache = {});
  }

  getNamesInStoreWithPrefix() {
    const result = Array.from(this.storage)
      .filter(([key]) => key === this.prefix || key.startsWith(this.prefix + separator))
      .map(([key]) => key);
    
    return result;
  }

  #save(data: Record<string, unknown>) {
    this.storage.setItem(this.#storeKey, JSON.stringify(data));
  }

  #load(): Record<string, unknown> {
    const data = this.storage.getItem(this.#storeKey);
    const result = data ? JSON.parse(data) : {};
    if (logThis && result)
      console.log(`Loaded log specs for ${Object.keys(result).length} items`, result);
    return result;
  }
}

/**
 * State management for the log manager.
 * It will store it in the current session.
 */
export class StateManagerSession extends StateManager<LogSpecs<unknown>> {
  constructor(prefix: string, configName?: string) {
    super(window.sessionStorage, prefix, configName);
  }
}

export class StateManagerLocal extends StateManager<LogSpecs<unknown>> {
  constructor(prefix: string, configName?: string) {
    super(window.localStorage, prefix, configName);
  }
}


import { LogSpecs } from './log-specs';

const logThis = true;
const storePrefix = 'logSpecs';

export interface LogManagerState {
  save(data: Record<string, LogSpecs<unknown>>, configName?: string): void;
  load(configName?: string): Record<string, LogSpecs<unknown>>;
}

class LogManagerStateStorage implements LogManagerState {

  protected constructor(private storage: Storage) { }

  #getKey(configName?: string) {
    return storePrefix + (configName ? `-${configName}` : '');
  }

  getNamesInStoreWithPrefix() {
    const result = Array.from(this.storage)
      .filter(([key]) => key.startsWith(storePrefix))
      .map(([key]) => key);
    
    return result;
  }

  save(data: Record<string, LogSpecs<unknown>>, configName?: string) {
    this.storage.setItem(this.#getKey(configName), JSON.stringify(data));
  }

  load(configName?: string): Record<string, LogSpecs<unknown>> {
    const data = this.storage.getItem(this.#getKey(configName))
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
export class LogManagerStateSession extends LogManagerStateStorage {
  constructor() {
    super(window.sessionStorage);
  }
}

export class LogManagerStateLocalStorage extends LogManagerStateStorage {
  constructor() {
    super(window.localStorage);
  }
}


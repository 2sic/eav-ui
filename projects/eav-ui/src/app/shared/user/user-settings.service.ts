import { Injectable, signal, WritableSignal } from '@angular/core';
import { StateManagerLocal, StateManagerSession } from './state-manager';
import { EavLogger } from '../logging/eav-logger';

const logThis = false;
const nameOfThis = 'UserSettings';

const storeKey = 'user-settings';

@Injectable({ providedIn: 'root' })
export class UserSettings {
  log = new EavLogger(nameOfThis, logThis);
  constructor() {
    this.log.fn('constructor');
  }

  get local() { return this.#local ??= new StateManagerLocal(storeKey); }
  #local: StateManagerLocal;

  get session() { return this.#session ??= new StateManagerSession(storeKey); }
  #session: StateManagerSession;

  get<T>(key: string, longTerm = false): T {
    return (longTerm ? this.local : this.session).get(key);
  }

  set<T>(key: string, value: T, longTerm = false) {
    (longTerm ? this.local : this.session).add(key, value);
  }

  part<T extends Record<string, unknown>>({ key, data }: { key: string; data: T; }): UserSettingsPart<T> {
    return this.#getPart(key, data, true);
  }

  #getPart<T extends Record<string, unknown>>(key: string, data: T, longTerm = false): UserSettingsPart<T> {
    if (this.#partCache[key]) return this.#partCache[key] as unknown as UserSettingsPart<T>;
    const created = new UserSettingsPart(this, key, data, longTerm);
    this.#partCache[key] = created;
    return created as unknown as UserSettingsPart<T>;
  }
  #partCache: Record<string, UserSettingsPart<Record<string, unknown>>> = {};

  // partSession<T extends Record<string, unknown>>(key: string, data: T) {
  //   return this.part(key, data, false);
  // }

  // partLocal<T extends Record<string, unknown>>(key: string, data: T) {
  //   return this.part(key, data, true);
  // }
}

export class UserSettingsPart<T extends Record<string, unknown>> {
  log = new EavLogger(nameOfThis + 'Part', logThis);
  constructor(private userSettings: UserSettings, private storeKey: string, data: T, private longTerm = false) {
    const merged = { ...data, ...userSettings.get<T>(storeKey, longTerm) };
    this.log.fn('constructor', merged);
    this.#data = signal<T>(merged);
  }
  #data: WritableSignal<T>;

  get snapshot() { return this.#data(); }

  get data() { return this.#data.asReadonly(); }

  get<K extends keyof T>(key: K): T[K] {
    return this.#data()[key];
  }

  set<K extends keyof T>(key: K, value: T[K]) {
    this.#data.update(data => ({ ...data, [key]: value }));
    this.#save();
  }

  setAll(data: T) {
    this.#data.set(data);
    this.#save();
  }

  setMany(data: Partial<T>) {
    this.#data.update(old => ({ ...old, ...data }));
    this.#save();
  }

  #save() {
    const data = this.#data();
    this.log.fn('save', data);
    this.userSettings.set(this.storeKey, this.#data(), this.longTerm);
  }
}
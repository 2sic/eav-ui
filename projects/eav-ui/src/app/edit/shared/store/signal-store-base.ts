import { computed, Signal, signal } from '@angular/core';
import { EavLogger } from '../../../shared/logging/eav-logger';
import { ComputedCacheHelper } from '../../../shared/helpers/computed-cache';

const logThis = false;
const logThisUndefined = true;
const nameOfThis = 'SignalStoreBase';
/**
 * temp
 */
export class SignalStoreBase<TKey extends string | number, TValue> {
  /** Main Cache */
  #cache = signal<Record<TKey, TValue>>({} as Record<TKey, TValue>);

  /** Cached version of the list, with the latest object-values */
  #list = computed(() => Object.values(this.#cache()) as TValue[]);

  /** Cache for the inheriting classes, but as read-only */
  protected get cache(): Signal<Record<TKey, TValue>> {
    return this.#cache;
  }

  /** List for the inheriting classes, but as read-only */
  protected get list(): Signal<TValue[]> {
    return this.#list;
  }

  /**
   * Function to get the key / id for storing in the cache.
   * Default is to get the 'id' property of the item.
   * This should be overriden in the inheriting class.
   */
  protected getId: (item: TValue) => TKey = (item) => (item as any).id as TKey;

  protected sanitizeAdd: (item: TValue) => TValue = (item) => item;

  name: string;

  protected log: EavLogger;

  constructor(options: SignalStoreOptions) {
    this.log = new EavLogger(options.name ?? nameOfThis, options.logThis ?? logThisUndefined);
    this.log.a('SignalStoreBase created', { options });
    this.name = options.name;
  }

  //#region Add / Update / Remove / Clear Cache

  add(item: TValue): void {
    const l = this.log.fn('add', { item });
    if (!item)
      return l.end(null, 'item is null');

    // add to signal
    this.#cache.set({
      ...this.#cache(),
      [this.getId(item)]: this.sanitizeAdd(item)
    });
    l.end(null, 'added');
  }

  addMany(items: TValue[]): void {
    var l = this.log.fn('addMany', { items });
    if (!items || items.length == 0)
      return l.end(null, 'items is null or empty');

    // also add to signal, but in one go
    const result = items.reduce((acc, item) => ({
      ...acc,
      [this.getId(item)]: this.sanitizeAdd(item)
    }), { ...this.#cache() });
    
    this.#cache.set(result);
    l.end(null, 'added');
  }

  update(id: TKey, item: Partial<TValue>): void {
    const l = this.log.fn('update', { id, item });
    if (!id || !item)
      return l.end(null, 'id or item is null');

    const before = this.get(id);
    if (!before)
      return l.end(null, `Item with id ${id} not found in store`);

    // merge
    const newItem = { ...before, ...item };

    // add to signal
    this.#cache.set({
      ...this.#cache(),
      [id]: newItem
    });
    l.end(null, 'updated');
  }

  remove(formId: TKey): void {
    const l = this.log.fn('remove', { formId });
    const updatedStore = { ...this.#cache() };
    delete updatedStore[formId];
    this.#cache.set(updatedStore);
    l.end(null, 'removed');
  }

  clearCache(): void {
    const l = this.log.fn('clearCache');
    this.#cache.set({} as Record<TKey, TValue>);
    l.end(null, 'cleared');
  }

  //#endregion

  //#region Now-Getters

  get(id: TKey): TValue {
    const result = this.#cache()[id];
    this.log.a(`get(${id}) - ` + (result == null ? 'not' : '') + 'found');
    return result;
  }

  getAll(): TValue[] {
    const result = this.#list();
    this.log.a('getAll() - ' + `found ${result.length} items`);
    return result;
  }

  getMany(ids: TKey[]): TValue[] {
    const l = this.log.fn('getMany', { ids });
    const result = ids
      .map(id => this.#cache()[id])
      .filter(item => item != null);
    return l.r(result, `found ${result.length} items`);
  }

  //#endregion

  //#region Signal Getters

  getSignal(id: TKey): Signal<TValue> {
    const result = this.#itemSignalsCache.getOrCreateWithInfo(id, () => this.get(id));
    this.log.a(`getSignal(${id})`, { isNew: result.isNew });
    return result.signal;
  }
  #itemSignalsCache = new ComputedCacheHelper<TKey, TValue>();

  getListSignal(): Signal<TValue[]> {
    const list = this.#list;
    this.log.a(`getAllSignal() - found ${list().length} items`);
    return list;
  }

  //#endregion

}

export interface SignalStoreOptions {
  name: string;
  logThis?: boolean
}
import { computed, Signal, CreateComputedOptions } from '@angular/core';
import isEqual from 'lodash-es/isEqual';
import { named } from './signal.utilities';

export type ComputedCache<TKey extends string, TValue> = Record<TKey, Signal<TValue>>;

/**
 * Special helper with Signals to cache computed signals.
 */
export class ComputedCacheHelper<TKey extends string | number, TValue> {

  constructor(private name: string = 'cache-name?', private named: boolean = true) {
  }

  private cache: Record<TKey, Signal<TValue>> = {} as Record<TKey, Signal<TValue>>;

  get(key: TKey): Signal<TValue> {
    return this.cache[key];
  }

  buildProxy(factory: (name: string) => () => TValue, options: CreateComputedOptions<TValue> = null) {
    if (this.#proxy) throw new Error(`Proxy already built; it can't be again, as the factory could be unexpectedly different.`);
    this.#proxy = new Proxy(this.cache, {
      get: (_, fieldName) => {
        if (typeof fieldName === 'string')
          return this.getOrCreate(fieldName as TKey, factory(fieldName), options);
        throw new Error(`Invalid name: '${fieldName?.toString()}'`);
      }
    });
    return this.#proxy;
  }
  #proxy: Record<TKey, Signal<TValue>>;

  getOrCreate(key: TKey, factory: () => TValue, options: CreateComputedOptions<TValue> = null): Signal<TValue> {
    return this.getOrCreateWithInfo(key, factory, options).signal;
  }

  getOrCreateWithInfo(key: TKey, factory: () => TValue, options: CreateComputedOptions<TValue> = null): { signal: Signal<TValue>, isNew: boolean } {
    if (this.cache[key])
      return { signal: this.cache[key], isNew: false };
    const sig = computed(() => factory(), options ?? { equal: isEqual });
    const final = this.named
      ? named(`${this.name}-${key}`, sig)
      : sig;
    return { signal: this.set(key, final), isNew: true };
  }


  set(key: TKey, value: Signal<TValue>): Signal<TValue> {
    this.cache[key] = value;
    return value;
  }

  delete(key: TKey): void {
    delete this.cache[key];
  }

  clear(): void {
    Object.keys(this.cache).forEach((key) => {
      delete this.cache[key as TKey];
    });
  }
}
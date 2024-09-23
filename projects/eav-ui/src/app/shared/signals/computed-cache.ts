import { Signal, CreateComputedOptions } from '@angular/core';
import { computedObj } from './signal.utilities';

export type ComputedCache<TKey extends string, TValue> = Record<TKey, Signal<TValue>>;

/**
 * Special helper with Signals to cache computed signals.
 */
export class ComputedCacheHelper<TKey extends string | number, TValue> {

  static proxy<TKey extends string | number, TValue>(
    name: string = 'cache-name?',
    factory: (name: string) => () => TValue, options: CreateComputedOptions<TValue> = null,
  ) : Record<TKey, Signal<TValue>> {
    const cch =  new ComputedCacheHelper<TKey, TValue>(name);
    const proxy = cch.buildProxy(factory, options);
    return proxy;
  }

  constructor(private name: string = 'cache-name?') {
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
    const sig = computedObj(`${this.name}-${key}`, () => factory());
    return { signal: this.set(key, sig), isNew: true };
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
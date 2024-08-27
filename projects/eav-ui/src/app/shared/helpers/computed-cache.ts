import { computed, Signal, CreateComputedOptions } from '@angular/core';
import isEqual from 'lodash-es/isEqual';

export type ComputedCache<TKey extends string, TValue> = Record<TKey, Signal<TValue>>;

/**
 * Special helper with Signals to cache computed signals.
 */
export class ComputedCacheHelper<TKey extends string | number, TValue> {
  // private cache: ComputedCache<TKey, TValue> = {};// as any;

  private cache: Record<TKey, Signal<TValue>> = {} as Record<TKey, Signal<TValue>>;// as any;

  get(key: TKey): Signal<TValue> {
    return this.cache[key];
  }

  getOrCreate(key: TKey, factory: () => TValue, options: CreateComputedOptions<TValue> = null): Signal<TValue> {
    return this.getOrCreateWithInfo(key, factory, options).signal;
    // if (this.cache[key]) return this.cache[key];
    // const sig = computed(() => factory(), options ?? { equal: isEqual });
    // return this.set(key, sig);
  }

  getOrCreateWithInfo(key: TKey, factory: () => TValue, options: CreateComputedOptions<TValue> = null): { signal: Signal<TValue>, isNew: boolean } {
    if (this.cache[key])
      return { signal: this.cache[key], isNew: false };
    const sig = computed(() => factory(), options ?? { equal: isEqual });
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
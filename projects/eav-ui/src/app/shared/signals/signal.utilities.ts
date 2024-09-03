import { computed, Signal, WritableSignal } from '@angular/core';
import { SIGNAL } from '@angular/core/primitives/signals';
import isEqual from 'lodash-es/isEqual';


// export function computedNamed<T>(name: string, computation: () => T, options?: CreateComputedOptions<T>): Signal<T> {
//   const comp =  computed(computation, options) as Signal<T>;
//   return named(comp, name);
// }
// export function signalNamed<T>(name: string, initialValue: T): WritableSignal<T> {
//   const sig = signal(initialValue) as WritableSignal<T>;
//   return named(name, sig);
// }

export function named<TSig, TVal extends Signal<TVal> | WritableSignal<TVal>>(name: string, signal: TSig): TSig {
  if (!signal) return signal;
  const sigAny = signal as any;
  sigAny.debugName = name;
  if (!sigAny[SIGNAL]) return signal;
  (sigAny[SIGNAL]).debugName = name;
  return signal;
}



// wip atm unused
/** Slightly unclean signal with previous value */
// https://github.com/angular/angular/issues/54339
export function computedWithPrev<T>(computation: (prev: T | undefined) => T, initial?: T): Signal<T> {
	let previous = initial;
	return computed(() => {
		const newValue = computation(previous);
		previous = newValue;
		return newValue;
	}, { equal: isEqual });
}
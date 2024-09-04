import { computed, signal, Signal, WritableSignal } from '@angular/core';
import { SIGNAL } from '@angular/core/primitives/signals';
import isEqual from 'lodash-es/isEqual';


/**
 * Named signal with object equality check
 * @param name name for debugging
 * @param initialValue initial value to start the signal
 * @returns 
 */
export function signalObj<T>(name: string, initialValue: T): WritableSignal<T> {
  const sig = signal(initialValue, { equal: isEqual }) as WritableSignal<T>;
  return named(name, sig);
}

export function computedObj<T>(name: string, computation: () => T): Signal<T> {
  const comp =  computed(computation, { equal: isEqual }) as Signal<T>; // needs recast, because isEqual changes it to Signal<any>
  return named(name, comp);
}


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
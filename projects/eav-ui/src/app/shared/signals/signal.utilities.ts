import { computed, signal, Signal, WritableSignal } from '@angular/core';
import { ReactiveNode, SIGNAL } from '@angular/core/primitives/signals';
import isEqual from 'lodash-es/isEqual';
import { Observable, take } from 'rxjs';


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

// Either in the place where it is called, or if the service is only used in one place, in the service itself to return a signal instead
/**
 * Convert a single http get into a simple signal.
 * It will initialize with the optional initialValue and then update with the httpGet result.
 * As such, it has a first value, and will only update once.
 * @param name name of the signal for debugging
 * @param httpRequest the http request
 * @param initialValue optional initial value
 * @returns
 */
export function httpToSignal<T>(name: string, httpRequest: Observable<T>, initialValue: T = null): Signal<T> {
  const sig = signal(initialValue, { equal: isEqual }) as WritableSignal<T>;
  // take(1) to only get the first value, and close the subscription right afterwards - which is what happens to all normal http requests
  httpRequest.pipe(take(1)).subscribe(value => sig.set(value));
  return named(name, sig.asReadonly());
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

export function getVersion(signal: Signal<unknown>): number | null {
  if (!signal) return null;
  return (signal[SIGNAL] as ReactiveNode)?.version ?? null;
}

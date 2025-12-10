// Source - https://stackoverflow.com/a/62733441
// Posted by Mingwei Samuel
// Retrieved 2025-11-30, License - CC BY-SA 4.0

import { Signal } from '@angular/core';

/**
 * Extracts the type held by an Angular Signal.
 *
 * @example
 * ```ts
 * const mySignal: Signal<number> = signal(42);
 * type ValueType = typeofSignal<typeof mySignal>; // ValueType is inferred as number
 * ```
 */
export type typeofSignal<C extends Signal<any>> = C extends Signal<infer T> ? T : unknown;
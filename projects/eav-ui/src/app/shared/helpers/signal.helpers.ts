import { computed, CreateComputedOptions, Signal } from '@angular/core';
import { RxHelpers } from '../rxJs/rx.helpers';
import isEqual from 'lodash-es/isEqual';

export class SignalHelpers {
  /** Options for number signal to ensure equality only on value difference */
  static boolEquals: CreateComputedOptions<boolean> = {
    equal: RxHelpers.valueEquals<boolean>
  };

  /** Options for string signal to ensure equality only on value difference */
  static numberEquals: CreateComputedOptions<number> = {
    equal: RxHelpers.valueEquals<number>
  };

  /** Options for string signal to ensure equality only on value difference */
  static stringEquals: CreateComputedOptions<string> = {
    equal: RxHelpers.valueEquals<string>
  };

  // note: this doesn't work as expected; leaving in so nobody tries to repeat this
  // /** Options for string signal to ensure equality only on value difference */
  // static valueEquals: CreateComputedOptions<boolean | string | number> = {
  //   equal: RxHelpers.valueEquals<boolean | string | number>
  // };

  /** Options for object signal to ensure equality only on value difference */
  static objectEquals = { equal: isEqual };

  /**
   * Helper to _not_ set the equal and use the standard equal.
   * This is just to ensure that the code can explicitly show that RefEquals was expected,
   * and not an oversight.
   */
  static refEquals = {  };
}

// export class SignalEquals<T>: CreateComputedOptions<T> {
//   equal: RxHelpers.objectsEqual<T>;
// }


// wip atm unused
// /** Slightly unclean signal with previous value */
// // https://github.com/angular/angular/issues/54339
// export function computedWithPrev<T>(computation: (prev: T | undefined) => T, initial?: T): Signal<T> {
// 	let previous = initial;
// 	return computed(() => {
// 		const newValue = computation(previous);
// 		previous = newValue;
// 		return newValue;
// 	}, { equal: isEqual});
// }
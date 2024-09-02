import { computed, CreateComputedOptions, Signal } from '@angular/core';
import { RxHelpers } from '../rxJs/rx.helpers';
import isEqual from 'lodash-es/isEqual';
import transform from 'lodash-es/transform';
import isObject from 'lodash-es/isObject';

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


// https://gist.github.com/Yimiprod/7ee176597fef230d1451?permalink_comment_id=2569085
/**
 * This code is licensed under the terms of the MIT license
 *
 * Deep diff between two object, using lodash
 * @param  {Object} object Object compared
 * @param  {Object} base   Object to compare with
 * @return {Object}        Return a new object who represent the diff
 */
export function difference(object: any, base: any) {
	function changes(object: any, base: any) {
		return transform(object, function(result: Record<string, any>, value, key) {
			if (!isEqual(value, base[key])) {
				result[key] = (isObject(value) && isObject(base[key])) ? changes(value, base[key]) : value;
			}
		});
	}
	return changes(object, base);
}
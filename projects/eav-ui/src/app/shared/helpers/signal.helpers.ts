import { CreateComputedOptions } from '@angular/core';
import { RxHelpers } from '../rxJs/rx.helpers';
import { ValueEqualityFn } from '@angular/core/primitives/signals';

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
  static objectEquals = { equal: RxHelpers.objectsEqual };
}

// export class SignalEquals<T>: CreateComputedOptions<T> {
//   equal: RxHelpers.objectsEqual<T>;
// }
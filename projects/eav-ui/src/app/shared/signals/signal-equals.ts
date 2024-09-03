import { CreateComputedOptions } from '@angular/core';
import { RxHelpers } from '../rxJs/rx.helpers';
import isEqual from 'lodash-es/isEqual';

export class SignalEquals {
  /** Options for number signal to ensure equality only on value difference */
  static bool: CreateComputedOptions<boolean> = {
    equal: RxHelpers.valueEquals<boolean>
  };

  /** Options for string signal to ensure equality only on value difference */
  static number: CreateComputedOptions<number> = {
    equal: RxHelpers.valueEquals<number>
  };

  /** Options for string signal to ensure equality only on value difference */
  static string: CreateComputedOptions<string> = {
    equal: RxHelpers.valueEquals<string>
  };

  // note: this doesn't work as expected; leaving in so nobody tries to repeat this
  // /** Options for string signal to ensure equality only on value difference */
  // static valueEquals: CreateComputedOptions<boolean | string | number> = {
  //   equal: RxHelpers.valueEquals<boolean | string | number>
  // };

  /** Options for object signal to ensure equality only on value difference */
  static object = { equal: isEqual };

  /**
   * Helper to _not_ set the equal and use the standard equal.
   * This is just to ensure that the code can explicitly show that RefEquals was expected,
   * and not an oversight.
   */
  static ref = {  };
}

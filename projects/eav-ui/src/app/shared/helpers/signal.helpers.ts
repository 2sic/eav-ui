import { CreateComputedOptions } from '@angular/core';
import { RxHelpers } from '../rxJs/rx.helpers';

export class SignalHelpers {
  /** Options for string signal to ensure equality only on value difference */
  static stringChanges: CreateComputedOptions<string> = { equal: RxHelpers.stringEquals };

  /** Options for object signal to ensure equality only on value difference */
  static objectChanges: CreateComputedOptions<Record<string, any>> = { equal: RxHelpers.objectsEqual };
}
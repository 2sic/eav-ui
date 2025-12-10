/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  Directive,
  input,
  InputSignal,
  OnDestroy
} from '@angular/core';
import {
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR
} from '@angular/forms';
import { MAT_INPUT_VALUE_ACCESSOR } from '@angular/material/input';
import { MatTimepicker, MatTimepickerInput } from '@angular/material/timepicker';

/**
 * Custom directive to override the behavior of `MatTimepickerInput`.
 * This prevents the timepicker from opening automatically (e.g. on click).
 */
@Directive({
  selector: 'input[myMatTimepicker]',
  exportAs: 'myMatTimepickerInput',
  host: {
    // Set accessibility and style attributes
    'class': 'mat-timepicker-input',
    'role': 'combobox',
    'type': 'text',
    'aria-haspopup': 'listbox',
    '[attr.aria-activedescendant]': '_ariaActiveDescendant()',
    '[attr.aria-expanded]': '_ariaExpanded()',
    '[attr.aria-controls]': '_ariaControls()',
    '[attr.mat-timepicker-id]': 'timepicker()?.panelId',
    '[disabled]': 'disabled()',

    // Event handlers as in the original implementation
    '(blur)': '_handleBlur()',
    '(input)': '_handleInput($event)',
    '(keydown)': '_handleKeydown($event)',
  },
  providers: [
    // Provide form and Material value accessors as in the original
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: MyMatTimepickerInput,
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: MyMatTimepickerInput,
      multi: true,
    },
    {
      provide: MAT_INPUT_VALUE_ACCESSOR,
      useExisting: MyMatTimepickerInput,
    },
  ],
})
export class MyMatTimepickerInput<D> extends MatTimepickerInput<D> implements OnDestroy {

  /** The timepicker instance this input is connected to. */
  readonly timepicker: InputSignal<MatTimepicker<D>> = input.required<MatTimepicker<D>>({
    alias: 'myMatTimepicker',
  });

  constructor() {
    super();

    // Call the private method _cleanupClick().
    // This removes the default click listener that would otherwise open the picker.
    // The call uses a TypeScript hack (as any) to bypass the private restriction.
    // Background: The original implementation registers a click handler to open the picker automatically.
    // By calling this, you remove the handler and prevent the picker from opening on click.
    // See: https://github.com/angular/components/blob/main/src/material/timepicker/timepicker-input.ts
    // @ts-ignore
    (this as any)['_cleanupClick']();
  }
}
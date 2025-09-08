import { Directive, input, output } from '@angular/core';

// 2pp: needs to be a directive in order to make input, output functions work
@Directive()
export abstract class SaveCloseButtonBase {
  /** Button label, can be a translation key or plain text */
  label = input<string>('Form.Buttons.SaveAndClose');

  triggerOnFormSubmit = input<boolean>(false);

  /** Material icon name to show */
  icon = input<string>('done');

  /** Classes to apply to the button */
  ngClass = input<string>('');

  /** If true, disables the button. Can also be a function returning boolean */
  disabled = input<boolean | (() => boolean)>(false);

  /** Emits when the button is clicked */
  action = output<Event>();

  /** Derived property for disabled state */
  get isDisabled(): boolean {
    return typeof this.disabled === 'function' ? !!this.disabled() : !!this.disabled;
  }

  onClick(event: Event) {
    if (!this.isDisabled) {
      this.action.emit(event);
    }
  }
}
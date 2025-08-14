import { NgClass } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { ExtendedFabSpeedDialImports } from '../modules/extended-fab-speed-dial/extended-fab-speed-dial.imports';

@Component({
  selector: 'app-save-close-button',
  imports: [
    NgClass,
    MatIconModule,
    ...ExtendedFabSpeedDialImports,
    MatRippleModule,
    TranslateModule,
  ],
  templateUrl: './save-close-button.component.html',
  styleUrl: './save-close-button.component.scss'
})
export class SaveCloseButtonComponent {
  /** Button label, can be a translation key or plain text */
  label = input<string>('Form.Buttons.SaveAndClose');

  /** Material icon name to show */
  icon = input<string>('done');

  /** Button type, e.g. 'button' or 'submit' */
  type = input<'button' | 'submit'>('button');

  /** Classes to apply to the button */
  buttonClass = input<string | string[] | Record<string, boolean>>('');

  /** If true, disables the button. Can also be a function returning boolean */
  disabled = input<boolean | (() => boolean)>(false);

  /** If true, wraps the button as a floating action button */
  wrapWithFab = input<boolean>(false);

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
    // Optionally blur to prevent double submit
    (event.target as HTMLElement).blur();
  }
}
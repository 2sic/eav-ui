import { NgClass } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { ExtendedFabSpeedDialImports } from '../extended-fab-speed-dial/extended-fab-speed-dial.imports';

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
  styleUrls: ['./save-close-button.component.scss'],
})
export class SaveCloseButtonComponent {
  /** Button label, can be a translation key or plain text */
  label = input<string>('Form.Buttons.SaveAndClose');

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
    // Optionally blur to prevent double submit
    (event.target as HTMLElement).blur();
  }
}
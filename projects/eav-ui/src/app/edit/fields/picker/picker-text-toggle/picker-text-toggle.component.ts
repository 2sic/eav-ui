import { NgClass } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { ClickStopPropagationDirective } from '../../../../shared/directives/click-stop-propagation.directive';
import { TippyDirective } from '../../../../shared/directives/tippy.directive';
import { FieldState } from '../../field-state';

@Component({
  selector: 'app-picker-toggle-text',
  templateUrl: './picker-text-toggle.component.html',
  styleUrls: ['./picker-text-toggle.component.scss'],
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatButtonModule,
    NgClass,
    MatIconModule,
    ClickStopPropagationDirective,
    TippyDirective,
  ],
})
export class PickerTextToggleComponent {
  csDisabled = input<boolean>();
  allowText = input<boolean>();
  isTextMode = input(false);

  showBoth = input(true);

  pickerData = inject(FieldState).pickerData;

  constructor() { }

  toggleFreeText(disabled: boolean): void {
    if (disabled) return;
    this.pickerData.toggleFreeTextMode();
  }
}

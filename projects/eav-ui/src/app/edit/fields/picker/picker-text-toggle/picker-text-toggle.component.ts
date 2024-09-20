import { Component, inject, input, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { NgClass } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
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
    ExtendedModule,
    MatIconModule,
    TranslateModule,
    ClickStopPropagationDirective,
    TippyDirective,
  ],
})
export class PickerTextToggleComponent {
  @Input() csDisabled: boolean;
  @Input() allowText: boolean;
  isTextMode = input(false);

  showBoth = input(true);
  
  pickerData = inject(FieldState).pickerData;

  constructor() { }

  toggleFreeText(disabled: boolean): void {
    if (disabled) return;
    this.pickerData.state.toggleFreeTextMode();
  }
}

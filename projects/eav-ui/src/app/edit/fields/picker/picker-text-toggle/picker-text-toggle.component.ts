import { Component, inject, Input, OnInit } from '@angular/core';
import { PickerData } from '../picker-data';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { NgClass } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ClickStopPropagationDirective } from '../../../../shared/directives/click-stop-propagation.directive';
import { TippyDirective } from '../../../../shared/directives/tippy.directive';
import { FieldState } from '../../field-state';

// 2024-04-30 2dm Note: not going standalone yet, as the styling is then off
// must find out how to import the styles correctly to continue
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
export class PickerTextToggleComponent implements OnInit {
  @Input() csDisabled: boolean;
  @Input() allowText: boolean;
  @Input() freeTextMode: boolean;
  
  pickerData = inject(FieldState).pickerData as PickerData;

  constructor() { }

  ngOnInit(): void { }

  toggleFreeText(disabled: boolean): void {
    if (disabled) { return; }
    this.pickerData.state.toggleFreeTextMode();
  }
}

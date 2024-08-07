import { Component, Input, OnInit } from '@angular/core';
import { PickerData } from '../picker-data';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { NgClass } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ClickStopPropagationDirective } from 'projects/eav-ui/src/app/shared/directives/click-stop-propagation.directive';
import { TippyDirective } from 'projects/eav-ui/src/app/shared/directives/tippy.directive';

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
  @Input() pickerData: PickerData;
  @Input() csDisabled: boolean;
  @Input() allowText: boolean;
  @Input() freeTextMode: boolean;

  constructor() { }

  ngOnInit(): void { }

  toggleFreeText(disabled: boolean): void {
    if (disabled) { return; }
    this.pickerData.state.toggleFreeTextMode();
  }
}

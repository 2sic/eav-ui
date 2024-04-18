import { Component, Input, OnInit } from '@angular/core';
import { PickerData } from '../picker-data';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { NgClass } from '@angular/common';
import { SharedComponentsModule } from '../../../../../shared/shared-components.module';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
    selector: 'app-picker-toggle-text',
    templateUrl: './picker-text-toggle.component.html',
    styleUrls: ['./picker-text-toggle.component.scss'],
    standalone: true,
    imports: [
        MatFormFieldModule,
        MatButtonModule,
        SharedComponentsModule,
        NgClass,
        ExtendedModule,
        MatIconModule,
        TranslateModule,
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

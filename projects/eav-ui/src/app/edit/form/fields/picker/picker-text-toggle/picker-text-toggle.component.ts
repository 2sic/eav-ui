import { Component, Input, OnInit } from '@angular/core';
import { PickerData } from '../picker-data';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { TippyStandaloneDirective } from 'projects/eav-ui/src/app/shared/directives/tippy-Standalone.directive';
import { NgClass } from '@angular/common';

// 2024-04-30 2dm Note: not going standalone yet, as the styling is then off
// must find out how to import the styles correctly to continue
@Component({
  selector: 'app-picker-toggle-text',
  // standalone: true,
  templateUrl: './picker-text-toggle.component.html',
  styleUrls: ['./picker-text-toggle.component.scss'],
  // imports: [
  //   NgClass,
  //   MatIconModule,
  //   TranslateModule,
  //   TippyStandaloneDirective,
  // ],
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

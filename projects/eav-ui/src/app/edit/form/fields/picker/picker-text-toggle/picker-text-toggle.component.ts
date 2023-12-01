import { Component, Input, OnInit } from '@angular/core';
import { PickerStateAdapter } from '../adapters/picker-state-adapter';

@Component({
  selector: 'app-picker-toggle-text',
  templateUrl: './picker-text-toggle.component.html',
  styleUrls: ['./picker-text-toggle.component.scss'],
})
export class PickerTextToggleComponent implements OnInit {
  @Input() pickerStateAdapter: PickerStateAdapter;
  @Input() controlStatusDisabled: boolean;
  @Input() allowText: boolean;
  @Input() freeTextMode: boolean;

  constructor() { }

  ngOnInit(): void { }

  toggleFreeText(disabled: boolean): void {
    if (disabled) { return; }
    this.pickerStateAdapter.toggleFreeTextMode();
  }
}

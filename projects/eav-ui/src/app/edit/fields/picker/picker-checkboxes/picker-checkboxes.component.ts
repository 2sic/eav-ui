import { Component } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { FlexModule } from '@angular/flex-layout/flex';
import { MatRippleModule } from '@angular/material/core';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { NgClass } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { PickerPartBaseComponent } from '../picker-part-base.component';
import { computedObj } from '../../../../shared/signals/signal.utilities';
import { MatCheckbox } from '@angular/material/checkbox';
import { PickerItem } from 'projects/edit-types';

@Component({
  selector: 'app-picker-checkboxes',
  templateUrl: './picker-checkboxes.component.html',
  styleUrls: ['./picker-checkboxes.component.scss'],
  standalone: true,
  imports: [
    MatFormFieldModule,
    NgClass,
    ExtendedModule,
    MatRippleModule,
    FlexModule,
    MatListModule,
    MatCheckbox,
  ],
})
export class PickerCheckboxesComponent extends PickerPartBaseComponent {

  constructor() { super(); }

  itemCount = computedObj('itemCount', () => this.selectedItems().length);

  options = computedObj('optionsWithSelection', () => {
    const options = this.pickerData.optionsFinal();
    const selected = this.selectedItems();
    const final = options.map(o => {
      const isSelected = selected.find((s) => s.value === o.value);
      return isSelected ? { ...isSelected, selected: true } : o;
    });
    return final as (PickerItem & { selected?: boolean})[];
  });
  
  select(item: PickerItem) {
    console.log('pick', item);
    const before = this.options();
    const toggled = before.map(o => o.value === item.value ? { ...o, selected: !o.selected } : o);
    const selected = toggled.filter(o => o.selected);
    const values = selected.map(o => o.value);
    this.pickerData.state.set(values);
  }

}

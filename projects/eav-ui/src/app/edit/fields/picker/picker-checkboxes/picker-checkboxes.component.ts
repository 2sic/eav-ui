import { Component } from '@angular/core';
import { FlexModule } from '@angular/flex-layout/flex';
import { MatRippleModule } from '@angular/material/core';
import { NgClass } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { PickerPartBaseComponent } from '../picker-part-base.component';
import { computedObj } from '../../../../shared/signals/signal.utilities';
import { MatCheckbox } from '@angular/material/checkbox';
import { PickerItem } from 'projects/edit-types';
import { TippyDirective } from 'projects/eav-ui/src/app/shared/directives/tippy.directive';
import { PickerIconHelpComponent } from '../picker-icon-help/picker-icon-help.component';
import { PickerIconInfoComponent } from '../picker-icon-info/picker-icon-info.component';
import { FeaturesScopedService } from 'projects/eav-ui/src/app/features/features-scoped.service';

@Component({
  selector: 'app-picker-checkboxes',
  templateUrl: './picker-checkboxes.component.html',
  styleUrls: ['./picker-checkboxes.component.scss'],
  standalone: true,
  imports: [
    MatFormFieldModule,
    NgClass,
    MatRippleModule,
    FlexModule,
    MatCheckbox,
    TippyDirective,
    PickerIconHelpComponent,
    PickerIconInfoComponent,
  ],
})
export class PickerCheckboxesComponent extends PickerPartBaseComponent {

  constructor(protected featuresSvc: FeaturesScopedService) {
    super();
    this.fieldState.requireFeature('PickerUiCheckbox');
  }

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
    const allowMulti = this.allowMultiValue();
    console.log(`select, allowMulti: ${allowMulti}`, item);
    if (!allowMulti) {
      this.pickerData.state.set([item.value]);
      return;
    }

    const before = this.options();
    const toggled = before.map(o => o.value === item.value ? { ...o, selected: !o.selected } : o);
    const selected = toggled.filter(o => o.selected);
    const values = selected.map(o => o.value);
    this.pickerData.state.set(values);
  }

}

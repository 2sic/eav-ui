import { inject } from '@angular/core';
import { PickerPartBaseComponent } from '../picker-part-base.component';
import { computedObj } from '../../../../shared/signals/signal.utilities';
import { PickerItem } from 'projects/edit-types';
import { FeaturesScopedService } from 'projects/eav-ui/src/app/features/features-scoped.service';

export abstract class PickerInlineBaseComponent extends PickerPartBaseComponent {

  protected featuresSvc = inject(FeaturesScopedService);

  constructor() {
    super();
  }

  itemCount = computedObj('itemCount', () => this.selectedItems().length);

  options = computedObj('optionsWithSelection', () => {
    const options = this.pickerData.optionsFinal();
    const selected = this.selectedItems();
    const final = options.map(o => {
      const isSelected = selected.find((s) => s.value === o.value);
      return { ...o, selected: !!isSelected };
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

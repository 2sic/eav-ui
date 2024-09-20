import { PickerPartBaseComponent } from '../picker-part-base.component';
import { computedObj } from '../../../../shared/signals/signal.utilities';
import { PickerItem } from '../models/picker-item.model';
import { classLog } from '../../../../shared/logging';

const logSpecs = {
  all: true,
  options: true,
  select: true,
};

export abstract class PickerInlineBaseComponent extends PickerPartBaseComponent {

  log = classLog({PickerInlineBaseComponent}, logSpecs);

  constructor() {
    super();
  }

  options = computedObj('optionsWithSelection', () => {
    const options = this.pickerData.optionsFinal();
    const selected = this.selectedItems();

    // First find options which are missing (e.g. a text value which was added manually)


    // Off all the possible options, mark the ones that are selected
    const final = options.map(o => {
      const isSelected = selected.find((s) => s.value === o.value);
      return { ...o, selected: !!isSelected };
    });
    this.log.aIf('options', { options, selected, final });
    return final as (PickerItem & { selected?: boolean})[];
  });
  
  select(item: PickerItem) {
    const allowMulti = this.allowMultiValue();
    console.log(`select, allowMulti: ${allowMulti}`, item);
    if (!allowMulti) {
      this.pickerData.state.set([item.value]);
      this.log.aIf('select', { item, allowMulti });
      return;
    }

    const before = this.options();
    const toggled = before.map(o => o.value === item.value ? { ...o, selected: !o.selected } : o);
    const selected = toggled.filter(o => o.selected);
    const values = selected.map(o => o.value);
    this.log.aIf('select', { item, allowMulti, before, toggled, selected, values });
    this.pickerData.state.set(values);
  }

}

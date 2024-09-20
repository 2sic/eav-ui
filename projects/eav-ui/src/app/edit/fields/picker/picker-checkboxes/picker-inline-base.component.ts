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

  constructor() { super(); }

  options = computedObj('options', () => {
    const options = this.pickerData.optionsWithMissing();
    const selected = this.selectedItems();

    // Off all the possible options, mark the ones that are selected
    const final = options.map(o => {
      const isSelected = selected.find((s) => s.value === o.value);
      return { ...o, selected: !!isSelected };
    });
    this.log.aIf('options', { options, selected, final });
    return final as (PickerItem & { selected?: boolean})[];
  });
  
  select(item: PickerItem) {
    const l = this.log.fn('select', { item });
    if (item.noSelect) return l.end('noSelect, exit early');
    const allowMulti = this.allowMultiValue();
    l.values({ allowMulti });
    if (!allowMulti) {
      this.pickerData.state.set([item.value]);
      return;
    }

    const before = this.options();
    const toggled = before.map(o => o.value === item.value ? { ...o, selected: !o.selected } : o);
    const selected = toggled.filter(o => o.selected);
    const values = selected.map(o => o.value);
    this.pickerData.state.set(values);
    l.end('ok', { item, allowMulti, before, toggled, selected, values });
  }

}

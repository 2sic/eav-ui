import { ButtonGroupByView, ButtonGroupValue } from './button-groups';
import { SelectSettings } from './tinymce-config';

export class ButtonGroupSelector {
  constructor(public settings: SelectSettings) {
  }

  public select(groups: ButtonGroupByView) {
    const set = groups[this.settings.view];
    const result = set?.[this.settings.mode];
    return [this.runOrReturn(result)].flat();
  }

  public runOrReturn(value: ButtonGroupValue) {
    if (typeof value === 'function')
      return value(this.settings);
    return value;
  }
}

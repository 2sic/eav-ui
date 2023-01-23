import { ButtonGroupByView } from './button-groups';
import { ConfigForDisplayModes, ConfigForEditModes } from './config-for-view-modes';
import { SelectSettings } from './tinymce-config';

// TODO: this is not well designed yet, as the final form isn't decided
// Still WIP 2023-01-23 2dm
export class ButtonGroupSelector {
  constructor(public settings: SelectSettings) {
  }

  public selectDisplayMode<T>(groups: ConfigForDisplayModes<T>): T {
    return groups[this.settings.displayMode];
  }

  public selectEditMode<T>(groups: ConfigForEditModes<T>): T {
    const result = groups?.[this.settings.editMode] ?? groups?.default;
    return this.runOrReturn(result);
  }

  public selectButtonGroup(groups: ButtonGroupByView): string[] {
    return [this.selectDisplayThenEdit(groups) as string | string[]].flat();
  }


  public selectDisplayThenEdit<T>(groups: ConfigForDisplayModes<ConfigForEditModes<T>>): T {
    const set = this.selectDisplayMode(groups);
    const result = this.selectEditMode(set);
    return result;
  }

  public runOrReturn<T>(value: T | ((settings: SelectSettings) => T)) : T {
    if (typeof value === 'function')
      return (value as (settings: SelectSettings) => T)(this.settings);
    return value;
  }
}

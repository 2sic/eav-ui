import { consoleLogWebpack } from '../../../field-custom-gps/src/shared/console-log-webpack.helper';
import { ButtonGroupByView } from './button-groups';
import { ConfigForDisplayModes, ConfigForEditModes } from './config-for-view-modes';
import { SelectSettings } from './types/select-settings';

// TODO: this is not well designed yet, as the final form isn't decided
// Still WIP 2023-01-23 2dm
export class ButtonGroupSelector {
  constructor(public settings: SelectSettings) {
    console.log('2dm ButtonGroupSelector', settings);
  }

  public selectDisplayMode<T>(groups: ConfigForDisplayModes<T>): T {
    return groups[this.settings.displayMode];
  }

  public selectEditMode<T>(groups: ConfigForEditModes<T>): T {
    let key = this.settings.editMode ?? 'default';
    let result = groups?.[key];
    if (!result) {
      consoleLogWebpack(`2dm result not found for '${key}', will try next`, groups);
      key = key?.split('-')[0];
      result = groups?.[key];
    }
    if (!result) {
      consoleLogWebpack(`2dm result not found for '${key}', will use default`);
      result = groups?.default;
    }
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

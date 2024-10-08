import { FieldSettings, FieldSettingsSharedSeparator } from '../../../../../../../edit-types/src/FieldSettings';
import { convertArrayToString } from '../picker.helpers';
import { StateUiMapperWithSettingsBase } from './state-ui-mapper-base';

/**
 * A mapper that converts a string to a number .
 *
 * Typically used for string-pickers, where the data is a string but the UI is an array of strings.
 */
export class StateUiMapperNumberArray extends StateUiMapperWithSettingsBase<number, string[]> {
  /**
    * Convert a number to an array of strings for use in the UI.
    */
  toUi(state: number): string[] {
    return state == null
      ? []
      : [state.toString()];
  }

  /**
  * Convert an array of strings to a number for state.
  */
  toState(uiValue: string[]): number {
    const stringValue = (uiValue == null || uiValue.length === 0)
      ? ''
      : convertArrayToString(uiValue, (this.settings() as FieldSettings & FieldSettingsSharedSeparator).Separator);

    const parsedNumber = Number(stringValue);
    return isNaN(parsedNumber) ? null : parsedNumber;
  }
}

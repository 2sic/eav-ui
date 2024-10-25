import { convertArrayToString } from '../picker.helpers';
import { StateUiMapperBase } from './state-ui-mapper-base';

/**
 * A mapper that converts a string to an array of strings, and vice versa.
 *
 * Typically used for string-pickers, where the data is a string but the UI is an array of strings.
 */
export class StateUiMapperStringArray extends StateUiMapperBase<string, string[]> {
  /**
   * Convert a string to an array of strings for use in the UI.
   */
  toUi(state: string): string[] {
    return (state == null || state === '')
      ? []
      : state.split(this.settings().Separator) ?? [];
  }

  /**
   * The state needs a string, using the specified separator.
   */
  toState(uiValue: string[]): string {
    return (uiValue == null || uiValue.length === 0) 
      ? ''
      : convertArrayToString(uiValue, this.settings().Separator);
  }
}
import { DropdownOption } from '../../../../../edit-types';

/** Takes current value and dropdownValues string from settings and calculates options for dropdown */
export function calculateDropdownOptions(currentValue: string, dropdownValues: string) {
  let currentValueFound = false;
  let options: DropdownOption[] = [];
  if (dropdownValues) {
    const dropdownValuesArray = dropdownValues.replace(/\r/g, '').split('\n');
    options = dropdownValuesArray.map(e => {
      const s = e.split(':');
      const maybeWantedEmptyVal = s[1];
      const key = s.shift();
      const val = s.join(':');
      const option = {
        label: key,
        value: (val || maybeWantedEmptyVal === '') ? val : key
      };
      if (option.value === currentValue) { currentValueFound = true; }
      return option;
    });
  }
  if (!currentValueFound) {
    options.push({
      label: currentValue,
      value: currentValue,
    });
  }
  return options;
}

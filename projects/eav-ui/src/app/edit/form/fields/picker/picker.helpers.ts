import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';
import { DropdownOption, PickerItem } from '../../../../../../../edit-types';
import { guidRegex } from '../../../../shared/constants/guid.constants';

const logThis = false;

export function correctStringEmptyValue(
  fieldValue: string | string[],
  separator: string,
  dropdownOptions: DropdownOption[] // Options are used only for legacy use case is where the value is an empty string
): PickerItem[] {
  const log = new EavLogger('correctStringEmptyValue', logThis);

  const valueAsArray = typeof fieldValue === 'string'
    ? convertValueToArray(fieldValue, separator, dropdownOptions)
    : fieldValue;

  const result = valueAsArray.map(value => {
    const option = dropdownOptions?.find(o => o.value == value);
    return ({
      // if it's a free text value or not found, disable edit and delete
      noEdit: true,
      noDelete: true,
      // either the real value or null if text-field or not found
      id: null,
      label: option?.label ?? value,
      tooltip: `${value}`,
      value: value,
    } satisfies PickerItem);
  });

  log.a('equalizeSelectedItems', [
    'fieldValue', `'${fieldValue}'`,
    'separator', `'${separator}'`,
    'dropdownOptions', dropdownOptions,
    'valueAsArray', valueAsArray,
    'result', result,
  ]);
  return result;
}

/** Convert string value in string array if a value is type string */
export function convertValueToArray(value: string | string[], separator: string, dropdownOptions?: DropdownOption[]): string[] {
  // Special case: String-picker old with "empty" being selected
  // In most dropdowns, empty would mean not-selected, but in string-dropdowns, it _can_ be a valid value
  // So we must check if there is an empty value in the dropdown options
  // And if this is true, return an array with an empty string being "selected"
  if (value == '' && dropdownOptions?.some(o => o.value == ''))
    return [''];

  if (value == '' || !value) return [];

  return (Array.isArray(value))
    ? value
    : value.split(separator);
}

/** Convert string array value in string value if a value is type array */
export function convertArrayToString(value: string | string[], separator: string): string {
  if (!value) { return ''; }

  if (Array.isArray(value)) { return value.join(separator); }

  return value;
}

export function filterGuids(entityName: string, fieldName: string, guids: string[]): string[] {
  if (guids == null) { return; }

  const validGuids: string[] = [];
  const invalidGuids: string[] = [];
  for (const guid of guids) {
    if (guidRegex().test(guid)) {
      validGuids.push(guid);
    } else {
      invalidGuids.push(guid);
    }
  }

  if (invalidGuids.length > 0) {
    console.error(`Found invalid guids in Entity: "${entityName}", Field: "${fieldName}"`, invalidGuids);
  }

  return validGuids;
}

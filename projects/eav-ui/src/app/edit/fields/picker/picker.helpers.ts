import groupBy from 'lodash-es/groupBy';
import { guidRegex } from '../../../shared/constants/guid.constants';
import { PickerItem } from './models/picker-item.model';

export function pickerItemsAllowsEmpty(dropdownOptions?: PickerItem[]): boolean {
  return dropdownOptions?.some(o => o.value == '');
}

/** Convert string value in string array if a value is type string */
export function convertValueToArray(value: string | string[], separator: string, emptyIsValid: boolean): string[] {
  // Special case: String-picker old with "empty" being selected
  // In most dropdowns, empty would mean not-selected, but in string-dropdowns, it _can_ be a valid value
  // So we must check if there is an empty value in the dropdown options
  // And if this is true, return an array with an empty string being "selected"
  if (value == '' && emptyIsValid)
    return [''];

  if (value == '' || !value)
    return [];

  return (Array.isArray(value))
    ? value
    : value.split(separator);
}

/** Convert string array value in string value if a value is type array */
export function convertArrayToString(value: string | string[], separator: string): string {
  if (!value)
    return '';
  if (Array.isArray(value))
    return value.join(separator);
  return value;
}

export function filterGuids(entityName: string, fieldName: string, guids: string[]): string[] {
  if (guids == null) return;

  const grouped = groupBy(guids, guid => guidRegex().test(guid) ? 'valid' : 'invalid');

  // const validGuids: string[] = [];
  // const invalidGuids: string[] = [];
  // for (const guid of guids) {
  //   if (guidRegex().test(guid)) {
  //     validGuids.push(guid);
  //   } else {
  //     invalidGuids.push(guid);
  //   }
  // }

  if (grouped.invalid) // invalidGuids.length > 0)
    console.error(`Found invalid guids in Entity: "${entityName}", Field: "${fieldName}"`, grouped.invalid); // invalidGuids);

  return grouped.valid ?? []; // validGuids;
}

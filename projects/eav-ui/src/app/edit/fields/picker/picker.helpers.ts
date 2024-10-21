import groupBy from 'lodash-es/groupBy';
import { PickerOptionCustom } from '../../../../../../edit-types/src/DropdownOption';
import { guidRegex } from '../../../shared/constants/guid.constants';
import { classLog } from '../../../shared/logging';
import { PickerItem } from './models/picker-item.model';

export function correctStringEmptyValue(
  valueAsArray: string[], // The value as an array of strings from state-adapter mapper
  dropdownOptions: PickerOptionCustom[] // Options are used only for legacy use case is where the value is an empty string
): PickerItem[] {

  const log = classLog({correctStringEmptyValue}, null, true);
  const l = log.fn('correctStringEmptyValue', { valueAsArray, dropdownOptions });

  const result = valueAsArray.map(value => {
    const option = dropdownOptions?.find(o => o.Value == value);
    return ({
      // if it's a free text value or not found, disable edit and delete
      noEdit: true,
      noDelete: true,
      // either the real value or null if text-field or not found
      id: null,
      label: option?.Title ?? value,
      tooltip: `${value}`,
      value: value?.toString() ?? '', // safe to-string
    } satisfies PickerItem);
  });

  l.a('correctStringEmptyValue', {
    dropdownOptions,
    valueAsArray,
    result,
  });
  return l.r(result);
}

export function optionsAllowsEmpty(dropdownOptions?: PickerOptionCustom[]): boolean {
  return dropdownOptions?.some(o => o.Value == '');
}
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

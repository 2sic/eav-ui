import { DropdownOption, PickerItem } from '../../../../../../../edit-types';
import { guidRegex } from '../../../../shared/constants/guid.constants';

export function equalizeSelectedItems(
  fieldValue: string | string[],
  separator: string,
  Options: DropdownOption[] // Options are used only for legacy usecase's where the value is an empty string
): PickerItem[] {
  const currentValueAsArray = typeof fieldValue === 'string' ? convertValueToArray(fieldValue, separator, Options) : fieldValue;

  const selectedEntities = currentValueAsArray.map(value => {
    const result: PickerItem = {
      // if it's a free text value or not found, disable edit and delete
      _disableEdit: true,
      _disableDelete: true,
      // either the real value or null if text-field or not found
      Id: null,
      Text: value,
      _tooltip: `${value}`,
      Value: value,
    };
    return result;
  });

  return selectedEntities;
}

/** Convert string value in string array if a value is type string */
export function convertValueToArray(value: string | string[], separator: string, Options?: DropdownOption[]): string[] {
  // this is for a usecase where the value is an empty string etc. label:value/value:label selection in string dropdown field configuration
  if (value == "" && Options?.some(o => o.value == "")) return [""];
  if (value == "") return [];
  else if (!value) return []; 

  if (Array.isArray(value)) { return value; }

  return value.split(separator);
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

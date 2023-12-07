import { TranslateService } from '@ngx-translate/core';
import { PickerItem } from '../../../../../../../edit-types';
import { guidRegex } from '../../../../shared/constants/guid.constants';

export function createUIModel(
  selectedItems: PickerItem[],
  data: PickerItem[],
  parameters: string,
  prefetch: (parameters: string, missingData: string[]) => void,
  translate: TranslateService,
): PickerItem[] {
  let missingData: string[] = [];

  const selectedEntities = selectedItems.map(item => {
    const entity = data.find(e => e.Value === item.Value);
    if (!entity) {
      missingData.push(item.Value);
      return item;
    } else {
      const text = entity?.Text ?? translate.instant('Fields.Entity.EntityNotFound');
      const disableEdit = entity._disableEdit === true;
      const disableDelete = entity._disableDelete === true;
      const tooltip = entity._tooltip ?? `${text} (${entity.Value})`;
      const information = entity._information ?? '';

      const result: PickerItem = {
        // if it's a free text value or not found, disable edit and delete
        _disableEdit: disableEdit,
        _disableDelete: disableDelete,
        // either the real value or null if text-field or not found
        Id: entity?.Id,
        Text: text,
        _tooltip: tooltip,
        _information: information,
        Value: entity.Value,
      };

      return result;
    }
  });

  if (missingData.length > 0) {
    prefetch(parameters, missingData);
  }

  return selectedEntities;
}

export function equalizeSelectedItems(
  fieldValue: string | string[],
  separator: string,
): PickerItem[] {
  const currentValueAsArray = typeof fieldValue === 'string' ? convertValueToArray(fieldValue, separator) : fieldValue;

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
export function convertValueToArray(value: string | string[], separator: string): string[] {
  if (!value) { return []; }

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

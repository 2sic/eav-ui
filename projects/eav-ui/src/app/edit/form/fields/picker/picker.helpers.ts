import { TranslateService } from '@ngx-translate/core';
import { DropdownOption, Entity, WIPDataSourceItem } from '../../../../../../../edit-types';
import { guidRegex } from '../../../../shared/constants/guid.constants';

import { EntityFieldDataSource } from './data-sources/entity-field-data-source';

export function calculateSelectedEntities(
  fieldValue: string | string[],
  data: WIPDataSourceItem[],
  separator: string,
  contentType: string,
  translate: TranslateService,
  entityDataSource: EntityFieldDataSource,
): WIPDataSourceItem[] {
  // name is either [guid] or simply free-text - convert to array for further processing
  const currentValueAsArray = typeof fieldValue === 'string' ? convertValueToArray(fieldValue, separator) : fieldValue;

  // Convert each value to WIPDataSourceItem so the UI has everything it needs
  const selectedEntities = currentValueAsArray.map(name => {
    const entity = data.find(e => e.Value === name);
    const disableEdit = entity?._disableEdit === true || (entity == null); // compensate for null/undefined
    const disableDelete = entity?._disableDelete === true || (entity == null); // compensate for null/undefined
    const text = entity?.Text ?? translate.instant('Fields.Entity.EntityNotFound');
    
    if (!entity) {
      entityDataSource.contentType(contentType);
      entityDataSource.entityGuids([name]);
      entityDataSource.getAll();
    }

    const result: WIPDataSourceItem = {
      // if it's a free text value or not found, disable edit and delete
      _disableEdit: disableEdit,
      _disableDelete: disableDelete,
      // either the real value or null if text-field or not found
      Id: entity?.Id,
      Text: text,
      _tooltip: `${text} (${name})`,
      Value: name,
    };

    return result;
  });
  
  return selectedEntities;
}

export function calculateStringSelectedOptions(
  fieldValue: string | string[],
  separator: string,
  options: DropdownOption[],
): WIPDataSourceItem[] {
  const currentValueAsArray = typeof fieldValue === 'string' ? convertValueToArray(fieldValue, separator) : fieldValue;

  const selectedEntities = currentValueAsArray.map(value => {
    const label = options?.find(o => o.value === value)?.label ?? value
    const result: WIPDataSourceItem = {
      // if it's a free text value or not found, disable edit and delete
      _disableEdit: true,
      _disableDelete: true,
      // either the real value or null if text-field or not found
      Id: null,
      Text: label,
      _tooltip: `${label} (${value})`,
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

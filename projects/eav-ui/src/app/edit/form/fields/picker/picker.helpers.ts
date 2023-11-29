import { TranslateService } from '@ngx-translate/core';
import { DropdownOption, WIPDataSourceItem } from '../../../../../../../edit-types';
import { guidRegex } from '../../../../shared/constants/guid.constants';

import { QueryEntity } from '../entity/entity-query/entity-query.models';

export function calculateSelectedEntities(
  fieldValue: string | string[],
  separator: string,
  entityCache: WIPDataSourceItem[],
  stringQueryCache: QueryEntity[],
  stringQueryValueField: string,
  stringQueryLabelField: string,
  translate: TranslateService,
): WIPDataSourceItem[] {
  if (Array.isArray(fieldValue)) { 
    if (typeof fieldValue[0] === 'string' && fieldValue[0].length === 1) {
      // console.error('SDV calculateSelectedEntities: fieldValue[0].length === 1');
      const guid = fieldValue.length === 36 ? fieldValue[35] : fieldValue.join('');
      const selectedEntities = entityCache.filter(entity => entity.Value === guid)
        .map(entity => { 
          const result: WIPDataSourceItem = {
            // debug info
            _sourceIsQuery: false,
            // if it's a free text value or not found, disable edit and delete
            _disableEdit: false,
            _disableDelete: false,
            // either the real value or null if text-field or not found
            Id: entity.Id,
            Text: entity.Text,
            _tooltip: `${entity.Text} (${entity.Value})`,
            Value: entity.Value,
          };
          return result;
        });
      return selectedEntities;
    }
  }
  // name is either [guid] or simply free-text - convert to array for further processing
  const currentValueAsArray = typeof fieldValue === 'string' ? convertValueToArray(fieldValue, separator) : fieldValue;

  // Convert each value to WIPDataSourceItem so the UI has everything it needs
  const selectedEntities = currentValueAsArray.map(name => {
    const entityFromType = entityCache.find(e => e.Value === name);
    const entityFromQuery = stringQueryCache.find(e => `${e[stringQueryValueField]}` === name);
    const entity = entityFromType || entityFromQuery;

    const disableEdit = entity?._disableEdit === true || (entity == null); // compensate for null/undefined
    const label = (name == null)
      ? translate.instant('Fields.Entity.EmptySlot')
      : (typeof fieldValue === 'string')
        ? entityFromQuery?.[stringQueryLabelField] ?? name
        : entityFromType?.Text ?? translate.instant('Fields.Entity.EntityNotFound');

    const result: WIPDataSourceItem = {
      // debug info
      _sourceIsQuery: entityFromQuery != null,
      // if it's a free text value or not found, disable edit and delete
      _disableEdit: disableEdit,
      _disableDelete: disableEdit,
      // either the real value or null if text-field or not found
      Id: entity?.Id,
      Text: label,
      _tooltip: `${label} (${name})`,
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
      // debug info
      _sourceIsQuery: false,
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

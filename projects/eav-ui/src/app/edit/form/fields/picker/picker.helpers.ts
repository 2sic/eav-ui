import { TranslateService } from '@ngx-translate/core';
import { EntityInfo } from '../../../../../../../edit-types';
import { guidRegex } from '../../../../shared/constants/guid.constants';

import { SelectedEntity } from '../entity/entity-default/entity-default.models';
import { QueryEntity } from '../entity/entity-query/entity-query.models';

export function calculateSelectedEntities(
  fieldValue: string | string[],
  separator: string,
  entityCache: EntityInfo[],
  stringQueryCache: QueryEntity[],
  stringQueryValueField: string,
  stringQueryLabelField: string,
  translate: TranslateService,
): SelectedEntity[] {
  // name is either [guid] or simply free-text - convert to array for further processing
  const currentValueAsArray = typeof fieldValue === 'string' ? convertValueToArray(fieldValue, separator) : fieldValue;

  // Convert each value to SelectedEntity so the UI has everything it needs
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

    const result: SelectedEntity = {
      // debug info
      _sourceIsQuery: entityFromQuery != null,
      // if it's a free text value or not found, disable edit and delete
      disableEdit,
      disableDelete: disableEdit,
      // either the real value or null if text-field or not found
      entityId: entity?.Id,
      label,
      tooltip: `${label} (${name})`,
      value: name,
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

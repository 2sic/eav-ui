import { TranslateService } from '@ngx-translate/core';
import { EntityInfo } from '../../../../../../../../edit-types';
import { guidRegex } from '../../../../../shared/constants/guid.constants';
import { QueryEntity } from '../entity-query/entity-query.models';
import { SelectedEntity } from './entity-default.models';

export function calculateSelectedEntities(
  fieldValue: string | string[],
  separator: string,
  entityCache: EntityInfo[],
  stringQueryCache: QueryEntity[],
  stringQueryValueField: string,
  stringQueryLabelField: string,
  translate: TranslateService,
): SelectedEntity[] {
  // name is guid or freetext
  const names = typeof fieldValue === 'string' ? convertValueToArray(fieldValue, separator) : fieldValue;
  const selectedEntities = names.map(name => {
    const entityFromType = entityCache.find(e => e.Value === name);
    const entityFromQuery = stringQueryCache.find(e => `${e[stringQueryValueField]}` === name);
    let label: string;
    let idForEdit: number;
    if (name == null) {
      label = translate.instant('Fields.Entity.EmptySlot');
      idForEdit = null;
    } else if (typeof fieldValue === 'string') {
      label = entityFromQuery?.[stringQueryLabelField] ?? name;
      idForEdit = entityFromQuery?.Id;
    } else {
      label = entityFromType?.Text ?? translate.instant('Fields.Entity.EntityNotFound');
      idForEdit = entityFromType?.Id;
    }
    const selectedEntity: SelectedEntity = {
      entityId: idForEdit,
      value: name,
      label,
      tooltip: `${label} (${name})`,
      // 2023-01-24 2dm - also added condition entityFromQuery == null
      // to ensure it can also be used on entities from query
      // must find out if this has a side-effect
      isFreeTextOrNotFound: entityFromType == null && entityFromQuery == null,
      _sourceIsQuery: entityFromQuery != null,
    };
    return selectedEntity;
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

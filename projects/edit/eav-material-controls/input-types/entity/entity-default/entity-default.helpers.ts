import { TranslateService } from '@ngx-translate/core';
import { EntityInfo } from '../../../../shared/models';
import { QueryEntity } from '../entity-query/entity-query.models';
import { SelectedEntity } from './entity-default.models';

export function calculateSelectedEntities(
  fieldValue: string | string[],
  separator: string,
  entityCache: EntityInfo[],
  stringQueryCache: QueryEntity[],
  stringQueryLabel: string,
  translate: TranslateService,
): SelectedEntity[] {
  // name is guid or freetext
  const names = typeof fieldValue === 'string' ? convertValueToArray(fieldValue, separator) : fieldValue;
  const selectedEntities = names.map(name => {
    const entity = entityCache.find(e => e.Value === name);
    const stringEntity = stringQueryCache.find(e => e.Guid === name);
    let label: string;
    if (name == null) {
      label = translate.instant('Fields.Entity.EmptySlot');
    } else if (typeof fieldValue === 'string') {
      label = stringEntity?.[stringQueryLabel] ?? name;
    } else {
      label = entity?.Text ?? translate.instant('Fields.Entity.EntityNotFound');
    }
    const selectedEntity: SelectedEntity = {
      value: name,
      label,
      tooltip: `${label} (${name})`,
      isFreeTextOrNotFound: entity == null,
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

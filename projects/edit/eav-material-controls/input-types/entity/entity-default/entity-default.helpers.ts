import { TranslateService } from '@ngx-translate/core';
import { EntityInfo } from '../../../../shared/models';
import { SelectedEntity } from './entity-default.models';

export function calculateSelectedEntities(
  fieldValue: string | string[],
  separator: string,
  availableEntities: EntityInfo[],
  translate: TranslateService,
) {
  // name is guid or freetext
  const names = typeof fieldValue === 'string' ? convertValueToArray(fieldValue, separator) : fieldValue;
  const selectedEntities = names.map(name => {
    const entity = availableEntities.find(e => e.Value === name);
    let label: string;
    if (name == null) {
      label = 'empty slot';
    } else if (typeof fieldValue === 'string') {
      label = entity != null ? entity.Text : name;
    } else {
      label = entity != null ? entity.Text : translate.instant('Fields.Entity.EntityNotFound');
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

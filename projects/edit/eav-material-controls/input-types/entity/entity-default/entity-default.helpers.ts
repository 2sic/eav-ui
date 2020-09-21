import { TranslateService } from '@ngx-translate/core';
import { Helper } from '../../../../shared/helpers/helper';
import { EntityInfo } from '../../../../shared/models/eav/entity-info';
import { SelectedEntity } from './entity-default.models';

export function calculateSelectedEntities(
  fieldValue: string | string[],
  separator: string,
  availableEntities: EntityInfo[],
  translate: TranslateService,
) {
  // name is guid or freetext
  const names = typeof fieldValue === 'string' ? Helper.convertValueToArray(fieldValue, separator) : fieldValue;
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

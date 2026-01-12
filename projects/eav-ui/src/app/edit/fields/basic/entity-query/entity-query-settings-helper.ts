import { FieldSettings } from '../../../../../../../edit-types/src/FieldSettings';
import { FieldSettingsEntityQuery } from '../../../../../../../edit-types/src/FieldSettings-Pickers';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { FieldSettingsHelperBase } from '../../logic/field-settings-helper-base';
import { FieldSettingsHelpersManager } from '../../logic/field-settings-helpers-manager';
import { FieldSettingsUpdateTask } from '../../logic/field-settings-update-task';
import { EntityDefaultSettingsHelper } from '../entity-default/entity-default-settings-helper';

export class EntityQuerySettingsHelper extends FieldSettingsHelperBase {
  name = InputTypeCatalog.EntityQuery;

  constructor() { super({ EntityQuerySettingsHelper }); }

  update(updateSpecs: FieldSettingsUpdateTask<string[]>): FieldSettings {
    const entityDefaultLogic = FieldSettingsHelpersManager.singleton().get(InputTypeCatalog.EntityDefault) as EntityDefaultSettingsHelper;
    const s = entityDefaultLogic.update(updateSpecs) as FieldSettings & FieldSettingsEntityQuery;
    s.Query ??= '';
    s.StreamName ||= 'Default';
    s.UrlParameters ??= '';
    return s;
  }
}

FieldSettingsHelperBase.add(EntityQuerySettingsHelper);

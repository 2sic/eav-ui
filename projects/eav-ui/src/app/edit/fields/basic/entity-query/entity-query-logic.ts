import { FieldSettingsEntityQuery } from '../../../../../../../edit-types/src/FieldSettings-Pickers';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { FieldLogicBase } from '../../logic/field-settings-helper-base';
import { FieldSettingsHelpersManager } from '../../logic/field-settings-helpers-manager';
import { FieldSettingsUpdateTask } from '../../logic/field-settings-update-task';
import { EntityDefaultLogic } from '../entity-default/entity-default-logic';
import { FieldSettings } from './../../../../../../../edit-types/src/FieldSettings';

export class EntityQueryLogic extends FieldLogicBase {
  name = InputTypeCatalog.EntityQuery;

  constructor() { super({ EntityQueryLogic }); }

  update(updateSpecs: FieldSettingsUpdateTask<string[]>): FieldSettings {
    const entityDefaultLogic = FieldSettingsHelpersManager.singleton().get(InputTypeCatalog.EntityDefault) as EntityDefaultLogic;
    const s = entityDefaultLogic.update(updateSpecs) as FieldSettings & FieldSettingsEntityQuery;
    s.Query ??= '';
    s.StreamName ||= 'Default';
    s.UrlParameters ??= '';
    return s;
  }
}

FieldLogicBase.add(EntityQueryLogic);

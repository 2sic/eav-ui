import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { FieldLogicBase, FieldLogicUpdate } from '../../logic/field-logic-base';
import { FieldLogicManager } from '../../logic/field-logic-manager';
import { FieldSettings } from './../../../../../../../edit-types/src/FieldSettings';

export class EntityQueryLogic extends FieldLogicBase {
  name = InputTypeCatalog.EntityQuery;

  constructor() { super({ EntityQueryLogic }); }

  update(updateSpecs: FieldLogicUpdate<string[]>): FieldSettings {
    const entityDefaultLogic = FieldLogicManager.singleton().get(InputTypeCatalog.EntityDefault);
    const fixedSettings = entityDefaultLogic.update(updateSpecs);
    fixedSettings.Query ??= '';
    fixedSettings.StreamName ||= 'Default';
    fixedSettings.UrlParameters ??= '';

    fixedSettings.MoreFields ??= '';
    fixedSettings.Label ??= '';

    return fixedSettings;
  }
}

FieldLogicBase.add(EntityQueryLogic);

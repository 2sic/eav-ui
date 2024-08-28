import { FieldSettings } from './../../../../../../../edit-types/src/FieldSettings';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { FieldLogicBase, FieldLogicUpdate } from '../../logic/field-logic-base';
import { FieldLogicManager } from '../../logic/field-logic-manager';

export class EntityQueryLogic extends FieldLogicBase {
  name = InputTypeCatalog.EntityQuery;

  update({ settings, tools, value }: FieldLogicUpdate<string[]>): FieldSettings {
    const entityDefaultLogic = FieldLogicManager.singleton().get(InputTypeCatalog.EntityDefault);
    const fixedSettings = entityDefaultLogic.update({ settings, value, tools });
    fixedSettings.Query ??= '';
    fixedSettings.StreamName ||= 'Default';
    fixedSettings.UrlParameters ??= '';

    fixedSettings.MoreFields ??= '';
    fixedSettings.Label ??= '';

    return fixedSettings;
  }
}

FieldLogicBase.add(EntityQueryLogic);

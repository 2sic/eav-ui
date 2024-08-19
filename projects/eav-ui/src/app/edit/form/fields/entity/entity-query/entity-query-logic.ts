import { FieldSettings } from '../../../../../../../../edit-types';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { FieldLogicBase, FieldLogicUpdate } from '../../../shared/field-logic/field-logic-base';
import { FieldLogicManager } from '../../../shared/field-logic/field-logic-manager';

export class EntityQueryLogic extends FieldLogicBase {
  name = InputTypeConstants.EntityQuery;

  update({ settings, tools, value }: FieldLogicUpdate<string[]>): FieldSettings {
    const entityDefaultLogic = FieldLogicManager.singleton().get(InputTypeConstants.EntityDefault);
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

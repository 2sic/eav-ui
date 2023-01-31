import { FieldSettings } from '../../../../../../../../edit-types';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { FieldLogicBase } from '../../../shared/field-logic/field-logic-base';
import { FieldLogicManager } from '../../../shared/field-logic/field-logic-manager';
import { FieldLogicTools } from '../../../shared/field-logic/field-logic-tools';

export class EntityQueryLogic extends FieldLogicBase {
  name = InputTypeConstants.EntityQuery;

  update(settings: FieldSettings, value: string[], tools: FieldLogicTools): FieldSettings {
    const entityDefaultLogic = FieldLogicManager.singleton().get(InputTypeConstants.EntityDefault);
    const fixedSettings = entityDefaultLogic.update(settings, value, tools);
    fixedSettings.Query ??= '';
    fixedSettings.StreamName ||= 'Default';
    fixedSettings.UrlParameters ??= '';
    return fixedSettings;
  }
}

FieldLogicBase.add(EntityQueryLogic);

import { FieldSettings } from '../../../../../../../../edit-types';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { EavConfig } from '../../../../shared/models';
import { FieldLogicBase } from '../../../shared/field-logic/field-logic-base';
import { FieldLogicManager } from '../../../shared/field-logic/field-logic-manager';

export class EntityQueryLogic extends FieldLogicBase {
  name = InputTypeConstants.EntityQuery;

  update(settings: FieldSettings, value: string[], eavConfig: EavConfig, debugEnabled: boolean): FieldSettings {
    const entityDefaultLogic = FieldLogicManager.singleton().get(InputTypeConstants.EntityDefault);
    const fixedSettings = entityDefaultLogic.update(settings, value, eavConfig, debugEnabled);
    fixedSettings.Query ??= '';
    fixedSettings.StreamName ||= 'Default';
    fixedSettings.UrlParameters ??= '';
    return fixedSettings;
  }
}

FieldLogicBase.add(EntityQueryLogic);

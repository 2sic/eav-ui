import { FieldSettings } from '../../../../../edit-types';
import { InputTypeConstants } from '../../../../../ng-dialogs/src/app/content-type-fields/constants/input-type.constants';
import { FieldLogicBase } from '../../../../field-logic/field-logic-base';
import { FieldLogicManager } from '../../../../field-logic/field-logic-manager';

export class EntityQueryLogic extends FieldLogicBase {
  name = InputTypeConstants.EntityQuery;

  update(settings: FieldSettings, value: string[]): FieldSettings {
    const entityDefaultLogic = FieldLogicManager.singleton().get(InputTypeConstants.EntityDefault);
    const fixedSettings = entityDefaultLogic.update(settings, value);
    fixedSettings.Query ??= '';
    fixedSettings.StreamName ||= 'Default';
    fixedSettings.UrlParameters ??= '';
    return fixedSettings;
  }
}

FieldLogicBase.add(EntityQueryLogic);

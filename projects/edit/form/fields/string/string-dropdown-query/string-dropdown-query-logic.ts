import { FieldSettings } from '../../../../../edit-types';
import { InputTypeConstants } from '../../../../../ng-dialogs/src/app/content-type-fields/constants/input-type.constants';
import { EavConfig } from '../../../../shared/models';
import { FieldLogicBase } from '../../../shared/field-logic/field-logic-base';
import { FieldLogicManager } from '../../../shared/field-logic/field-logic-manager';

export class StringDropdownQueryLogic extends FieldLogicBase {
  name = InputTypeConstants.StringDropdownQuery;

  update(settings: FieldSettings, value: string[], eavConfig: EavConfig, debugEnabled: boolean): FieldSettings {
    const entityDefaultLogic = FieldLogicManager.singleton().get(InputTypeConstants.EntityDefault);
    const fixedSettings = entityDefaultLogic.update(settings, value, eavConfig, debugEnabled);
    fixedSettings.Value ??= '';
    fixedSettings.Label ??= '';
    fixedSettings.EnableTextEntry ??= false;
    fixedSettings.Separator ||= ',';
    return fixedSettings;
  }
}

FieldLogicBase.add(StringDropdownQueryLogic);

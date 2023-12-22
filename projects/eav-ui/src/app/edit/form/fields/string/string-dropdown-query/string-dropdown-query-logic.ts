import { FieldSettings } from '../../../../../../../../edit-types';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { FieldLogicBase } from '../../../shared/field-logic/field-logic-base';
import { FieldLogicManager } from '../../../shared/field-logic/field-logic-manager';
import { FieldLogicTools } from '../../../shared/field-logic/field-logic-tools';

export class StringDropdownQueryLogic extends FieldLogicBase {
  name = InputTypeConstants.StringDropdownQuery;

  update(settings: FieldSettings, value: string[], tools: FieldLogicTools): FieldSettings {
    const entityDefaultLogic = FieldLogicManager.singleton().get(InputTypeConstants.EntityDefault);
    const fixedSettings = entityDefaultLogic.update(settings, value, tools);
    fixedSettings.Value ??= '';
    fixedSettings.Label ??= '';
    fixedSettings.EnableTextEntry ??= false;
    fixedSettings.Separator ||= ',';

    fixedSettings.Information ??= '';
    fixedSettings.Tooltip ??= '';
    fixedSettings.MoreFields ??= '';
    return fixedSettings;
  }
}

FieldLogicBase.add(StringDropdownQueryLogic);

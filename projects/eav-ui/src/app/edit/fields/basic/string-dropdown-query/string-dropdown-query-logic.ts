import { FieldLogicBase, FieldLogicUpdate } from '../../logic/field-logic-base';
import { FieldLogicManager } from '../../logic/field-logic-manager';
import { FieldSettings } from '../../../../../../../edit-types/src/FieldSettings';
import { InputTypeConstants } from '../../../../content-type-fields/constants/input-type.constants';

export class StringDropdownQueryLogic extends FieldLogicBase {
  name = InputTypeConstants.StringDropdownQuery;

  update(specs: FieldLogicUpdate<string[]>): FieldSettings {
    const entityDefaultLogic = FieldLogicManager.singleton().get(InputTypeConstants.EntityDefault);
    const fixedSettings = entityDefaultLogic.update(specs);
    fixedSettings.Value ??= '';
    fixedSettings.Label ??= '';
    fixedSettings.EnableTextEntry ??= false;
    fixedSettings.Separator ||= ',';

    fixedSettings.MoreFields ??= '';
    return fixedSettings;
  }
}

FieldLogicBase.add(StringDropdownQueryLogic);

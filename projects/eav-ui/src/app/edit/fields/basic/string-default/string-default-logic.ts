import { FieldLogicBase, FieldLogicUpdate } from '../../logic/field-logic-base';
import { InputTypeConstants } from '../../../../content-type-fields/constants/input-type.constants';
import { FieldSettings } from '../../../../../../../edit-types/src/FieldSettings';

export class StringDefaultLogic extends FieldLogicBase {
  name = InputTypeConstants.StringDefault;

  canAutoTranslate = true;

  update(specs: FieldLogicUpdate): FieldSettings {
    const fixedSettings: FieldSettings = { ...specs.settings };
    fixedSettings.InputFontFamily ??= '';
    fixedSettings.RowCount ||= 1;
    return fixedSettings;
  }
}

FieldLogicBase.add(StringDefaultLogic);

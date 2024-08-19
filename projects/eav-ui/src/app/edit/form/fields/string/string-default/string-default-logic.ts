import { FieldSettings } from '../../../../../../../../edit-types';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { FieldLogicBase, FieldLogicUpdate } from '../../../shared/field-logic/field-logic-base';

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

import { FieldSettings } from '../../../../../../../../edit-types';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { FieldLogicBase } from '../../../shared/field-logic/field-logic-base';

export class StringDefaultLogic extends FieldLogicBase {
  name = InputTypeConstants.StringDefault;

  canAutoTranslate = true;

  update(settings: FieldSettings, value: string): FieldSettings {
    const fixedSettings: FieldSettings = { ...settings };
    fixedSettings.InputFontFamily ??= '';
    fixedSettings.RowCount ||= 1;
    return fixedSettings;
  }
}

FieldLogicBase.add(StringDefaultLogic);

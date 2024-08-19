import { FieldSettings } from '../../../../../../../../edit-types';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { FieldLogicBase, FieldLogicUpdate } from '../../../shared/field-logic/field-logic-base';

export class StringFontIconPickerLogic extends FieldLogicBase {
  name = InputTypeConstants.StringFontIconPicker;

  update({ settings }: FieldLogicUpdate): FieldSettings {
    const fixedSettings: FieldSettings = { ...settings };
    fixedSettings.Files ??= '';
    fixedSettings.CssPrefix ??= '';
    fixedSettings.ShowPrefix ??= false;
    return fixedSettings;
  }
}

FieldLogicBase.add(StringFontIconPickerLogic);

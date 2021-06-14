import { FieldSettings } from '../../../../../edit-types';
import { InputTypeConstants } from '../../../../../ng-dialogs/src/app/content-type-fields/constants/input-type.constants';
import { FieldLogicBase } from '../../../shared/field-logic/field-logic-base';

export class StringFontIconPickerLogic extends FieldLogicBase {
  name = InputTypeConstants.StringFontIconPicker;

  update(settings: FieldSettings, value: string): FieldSettings {
    const fixedSettings: FieldSettings = { ...settings };
    fixedSettings.Files ??= '';
    fixedSettings.CssPrefix ??= '';
    fixedSettings.ShowPrefix ??= false;
    return fixedSettings;
  }
}

FieldLogicBase.add(StringFontIconPickerLogic);

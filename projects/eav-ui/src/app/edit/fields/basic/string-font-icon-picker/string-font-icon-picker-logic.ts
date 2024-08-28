import { FieldLogicBase, FieldLogicUpdate } from '../../logic/field-logic-base';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { FieldSettings } from '../../../../../../../edit-types/src/FieldSettings';

export class StringFontIconPickerLogic extends FieldLogicBase {
  name = InputTypeCatalog.StringFontIconPicker;

  update({ settings }: FieldLogicUpdate): FieldSettings {
    const fixedSettings: FieldSettings = { ...settings };
    fixedSettings.Files ??= '';
    fixedSettings.CssPrefix ??= '';
    fixedSettings.ShowPrefix ??= false;
    return fixedSettings;
  }
}

FieldLogicBase.add(StringFontIconPickerLogic);

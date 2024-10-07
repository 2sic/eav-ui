import { FieldSettingsWithPickerSource } from 'projects/edit-types/src/PickerSources';
import { FieldSettings, StringFontIconPicker } from '../../../../../../../edit-types/src/FieldSettings';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { FieldLogicBase, FieldLogicUpdate } from '../../logic/field-logic-base';

export class StringFontIconPickerLogic extends FieldLogicBase {
  name = InputTypeCatalog.StringFontIconPicker;

  constructor() { super({ StringFontIconPickerLogic }, true); }

  update({ fieldName, settings }: FieldLogicUpdate): FieldSettings {
    const l = this.log.fnIfInList('update', 'fields', fieldName, { fieldName, settings });
    const fixedSettings: FieldSettingsWithPickerSource = { ...settings } as FieldSettingsWithPickerSource;
    const oldSettings = fixedSettings as unknown as StringFontIconPicker;
    ///// OLD Settings
    // fixedSettings.Files ??= '';
    // fixedSettings.CssPrefix ??= '';
    // fixedSettings.ShowPrefix ??= false;

    fixedSettings.CssSourceFile = oldSettings.Files ?? '';
    fixedSettings.CssSelectorFilter = oldSettings.CssPrefix ?? '';
    fixedSettings.PreviewValue = oldSettings.PreviewCss + ' [Item:Value]';

    fixedSettings.PreviewType ='icon-css';
    fixedSettings.EnableTextEntry = false;
    fixedSettings.EnableAddExisting = false;

    // TODO: @2dg Label
    fixedSettings.Label = "Test";
    // fixedSettings.Label = fixedSettings.ShowPrefix
    // ? `${fixedSettings.CssPrefix} [Item:Value]`
    // : "[Item:Value]";;
    return l.r(fixedSettings);
  }
}

FieldLogicBase.add(StringFontIconPickerLogic);

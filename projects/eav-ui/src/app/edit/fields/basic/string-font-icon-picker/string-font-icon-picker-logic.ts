import { FieldSettings } from '../../../../../../../edit-types/src/FieldSettings';
import { FieldSettingsPicker, FieldSettingsPickerMasks, FieldSettingsStringFontIconPicker } from '../../../../../../../edit-types/src/FieldSettings-Pickers';
import { PickerSourceCss } from '../../../../../../../edit-types/src/PickerSources';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { FieldSettingsHelperBase } from '../../logic/field-settings-helper-base';
import { FieldSettingsUpdateTask } from '../../logic/field-settings-update-task';
import { buildRegExFromPrefixAndSuffix } from '../../picker/data-sources/css/string-font-icon-picker.helpers';

/**
 * Logic for the StringFontIconPicker field.
 * This is an older field, which was standalone till ca. v18.01.
 * 
 * In v18.02 it was changed to use the standard picker,
 * so it now ports the configuration from the names in the old config entity
 * to how the new picker expects them.
 */
export class StringFontIconPickerLogic extends FieldSettingsHelperBase {
  name = InputTypeCatalog.StringFontIconPicker;

  constructor() { super({ StringFontIconPickerLogic }); }

  update({ fieldName, settings }: FieldSettingsUpdateTask): FieldSettings {
    const l = this.log.fnIfInFields('update', fieldName, { fieldName, settings });

    // Cast settings to type which knows about the properties
    // and the raw settings which show what values can be read
    const fs = { ...settings } as FieldSettings & FieldSettingsPickerMasks & PickerSourceCss & FieldSettingsPicker;
    const raw = fs as unknown as FieldSettingsStringFontIconPicker;

    ///// OLD Settings
    // fixedSettings.Files ??= '';
    // fixedSettings.CssPrefix ??= '';
    // fixedSettings.ShowPrefix ??= false;

    // Note: the original Files was multi-line. We assume it was never used, but we can't be sure.
    fs.CssSourceFile = raw.Files ?? '';
    fs.CssSelectorFilter = raw.CssPrefix ?? '';
    fs.CssSelectorFilter = buildRegExFromPrefixAndSuffix(raw.CssPrefix ?? '', ':');
    fs.PreviewValue = `${raw.PreviewCss} [Item:Value]`;

    fs.PreviewType ='icon-css';
    fs.EnableTextEntry = false;
    fs.EnableAddExisting = true;
    fs.AllowMultiValue = false;

    fs.noAutoFocus = true;

    // The label should either be the entire class, or just the part after the prefix
    // These values will be in the `Value` or `Title` fields, respectively.
    fs.Label = raw.ShowPrefix ? 'Value' : 'Title';
    return l.r(fs);
  }
}

FieldSettingsHelperBase.add(StringFontIconPickerLogic);

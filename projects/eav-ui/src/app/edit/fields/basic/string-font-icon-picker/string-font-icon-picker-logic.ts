import { FieldSettings, StringFontIconPicker } from '../../../../../../../edit-types/src/FieldSettings';
import { PickerSourceCss } from '../../../../../../../edit-types/src/PickerSources';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { FieldLogicBase, FieldLogicUpdate } from '../../logic/field-logic-base';

/**
 * Logic for the StringFontIconPicker field.
 * This is an older field, which was standalone till ca. v18.01.
 * 
 * In v18.02 it was changed to use the standard picker,
 * so it now ports the configuration from the names in the old config entity
 * to how the new picker expects them.
 */
export class StringFontIconPickerLogic extends FieldLogicBase {
  name = InputTypeCatalog.StringFontIconPicker;

  constructor() { super({ StringFontIconPickerLogic }, true); }

  update({ fieldName, settings }: FieldLogicUpdate): FieldSettings {
    const l = this.log.fnIfInList('update', 'fields', fieldName, { fieldName, settings });

    // Cast settings to type which knows about the properties
    // and the raw settings which show what values can be read
    const fs = { ...settings } as unknown as FieldSettings & PickerSourceCss;
    const raw = fs as unknown as StringFontIconPicker;

    ///// OLD Settings
    // fixedSettings.Files ??= '';
    // fixedSettings.CssPrefix ??= '';
    // fixedSettings.ShowPrefix ??= false;

    // Note: the original Files was multi-line. We assume it was never used, but we can't be sure.
    fs.CssSourceFile = raw.Files ?? '';
    fs.CssSelectorFilter = raw.CssPrefix ?? '';
    fs.PreviewValue = `${raw.PreviewCss} [Item:Value]`;

    fs.PreviewType ='icon-css';
    fs.EnableTextEntry = false;
    fs.EnableAddExisting = true;
    fs.AllowMultiValue = false;

    // TODO: @2dg Label
    fs.Label = "Test";
    // fixedSettings.Label = fixedSettings.ShowPrefix
    // ? `${fixedSettings.CssPrefix} [Item:Value]`
    // : "[Item:Value]";;
    return l.r(fs);
  }
}

FieldLogicBase.add(StringFontIconPickerLogic);

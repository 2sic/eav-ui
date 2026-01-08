import { HyperlinkLibrary } from 'projects/edit-types/src/FieldSettings-Hyperlink';
import { FieldSettings } from '../../../../../../../edit-types/src/FieldSettings';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { FieldSettingsHelperBase } from '../../logic/field-settings-helper-base';
import { FieldSettingsUpdateTask } from '../../logic/field-settings-update-task';

export class HyperlinkLibrarySettingsHelper extends FieldSettingsHelperBase {
  name = InputTypeCatalog.HyperlinkLibrary;

  constructor() { super({ HyperlinkLibrarySettingsHelper }); }

  update({ settings }: FieldSettingsUpdateTask): FieldSettings {
    const fixedSettings = { ...settings } as FieldSettings & HyperlinkLibrary;
    fixedSettings.EnableImageConfiguration ??= true; // 2022-11-08 v14.12 changed default to true // false;
    return fixedSettings;
  }
}

FieldSettingsHelperBase.add(HyperlinkLibrarySettingsHelper);

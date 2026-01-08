import { Hyperlink } from 'projects/edit-types/src/FieldSettings-Hyperlink';
import { FieldSettings } from '../../../../../../../edit-types/src/FieldSettings';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { FieldSettingsHelperBase } from '../../logic/field-settings-helper-base';
import { FieldSettingsUpdateTask } from '../../logic/field-settings-update-task';

export class HyperlinkDefaultLogic extends FieldSettingsHelperBase {
  name = InputTypeCatalog.HyperlinkDefault;

  constructor() { super({ HyperlinkDefaultLogic }); }

  update({ settings }: FieldSettingsUpdateTask): FieldSettings {
    const fixedSettings = { ...settings } as FieldSettings & Hyperlink;
    fixedSettings.Buttons ||= 'adam,more';
    fixedSettings.FileFilter ??= '';
    fixedSettings.Paths ??= '';
    fixedSettings.ServerResourceMapping ??= '';
    fixedSettings.EnableImageConfiguration ??= true; // 2022-11-08 v14.12 changed default to true // false;
    return fixedSettings;
  }
}

FieldSettingsHelperBase.add(HyperlinkDefaultLogic);

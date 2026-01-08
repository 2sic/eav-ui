import { HyperlinkLibrary } from 'projects/edit-types/src/FieldSettings-Hyperlink';
import { FieldSettings } from '../../../../../../../edit-types/src/FieldSettings';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { FieldLogicBase } from '../../logic/field-logic-base';
import { FieldSettingsUpdateTask } from '../../logic/field-settings-update-task';

export class HyperlinkLibraryLogic extends FieldLogicBase {
  name = InputTypeCatalog.HyperlinkLibrary;

  constructor() { super({ HyperlinkLibraryLogic }); }

  update({ settings }: FieldSettingsUpdateTask): FieldSettings {
    const fixedSettings = { ...settings } as FieldSettings & HyperlinkLibrary;
    fixedSettings.EnableImageConfiguration ??= true; // 2022-11-08 v14.12 changed default to true // false;
    return fixedSettings;
  }
}

FieldLogicBase.add(HyperlinkLibraryLogic);

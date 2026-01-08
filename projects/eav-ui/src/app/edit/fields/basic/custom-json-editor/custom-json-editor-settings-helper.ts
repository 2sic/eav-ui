import { CustomJsonEditor } from 'projects/edit-types/src/FieldSettings-CustomJsonEditor';
import { FieldSettings } from '../../../../../../../edit-types/src/FieldSettings';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { FieldSettingsHelperBase } from '../../logic/field-settings-helper-base';
import { FieldSettingsUpdateTask } from '../../logic/field-settings-update-task';

export class CustomJsonEditorSettingsHelper extends FieldSettingsHelperBase {
  name = InputTypeCatalog.CustomJsonEditor as string;

  constructor() { super({ CustomJsonEditorSettingsHelper }); }

  update({ settings }: FieldSettingsUpdateTask): FieldSettings {
    const fixedSettings = { ...settings } as FieldSettings & CustomJsonEditor;
    fixedSettings.Rows ||= 5;
    fixedSettings.JsonValidation ||= 'strict';
    fixedSettings.JsonSchemaMode ||= 'none';
    fixedSettings.JsonSchemaSource ||= 'link';
    fixedSettings.JsonSchemaUrl ??= '';
    fixedSettings.JsonSchemaRaw ??= '';
    fixedSettings.JsonCommentsAllowed ??= false;
    return fixedSettings;
  }
}

FieldSettingsHelperBase.add(CustomJsonEditorSettingsHelper);

export class StringJsonSettingsHelper extends CustomJsonEditorSettingsHelper {
  name = InputTypeCatalog.StringJson;
}

FieldSettingsHelperBase.add(StringJsonSettingsHelper);

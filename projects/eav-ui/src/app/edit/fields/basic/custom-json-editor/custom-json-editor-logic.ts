import { CustomJsonEditor } from 'projects/edit-types/src/FieldSettings-CustomJsonEditor';
import { FieldSettings } from '../../../../../../../edit-types/src/FieldSettings';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { FieldLogicBase, FieldLogicUpdate } from '../../logic/field-logic-base';

export class CustomJsonEditorLogic extends FieldLogicBase {
  name = InputTypeCatalog.CustomJsonEditor as string;

  constructor() { super({ CustomJsonEditorLogic }); }

  update({ settings }: FieldLogicUpdate): FieldSettings {
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

FieldLogicBase.add(CustomJsonEditorLogic);

export class StringJsonLogic extends CustomJsonEditorLogic {
  name = InputTypeCatalog.StringJson;
}

FieldLogicBase.add(StringJsonLogic);

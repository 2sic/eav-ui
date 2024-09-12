import { FieldLogicBase, FieldLogicUpdate } from '../../logic/field-logic-base';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { FieldSettings } from '../../../../../../../edit-types/src/FieldSettings';

export class CustomJsonEditorLogic extends FieldLogicBase {
  name = InputTypeCatalog.CustomJsonEditor as string;

  constructor() { super({ CustomJsonEditorLogic }); }

  update({ settings }: FieldLogicUpdate): FieldSettings {
    const fixedSettings: FieldSettings = { ...settings };
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

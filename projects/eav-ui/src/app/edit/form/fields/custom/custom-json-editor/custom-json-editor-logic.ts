import { FieldSettings } from '../../../../../../../../edit-types';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { FieldLogicBase, FieldLogicUpdate } from '../../../shared/field-logic/field-logic-base';

export class CustomJsonEditorLogic extends FieldLogicBase {
  name = InputTypeConstants.CustomJsonEditor as string;

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
  name = InputTypeConstants.StringJson;
}

FieldLogicBase.add(StringJsonLogic);

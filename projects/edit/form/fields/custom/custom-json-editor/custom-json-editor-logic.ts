import { FieldSettings } from '../../../../../edit-types';
import { InputTypeConstants } from '../../../../../ng-dialogs/src/app/content-type-fields/constants/input-type.constants';
import { FieldLogicBase } from '../../../shared/field-logic/field-logic-base';

export class CustomJsonEditorLogic extends FieldLogicBase {
  name = InputTypeConstants.CustomJsonEditor;

  update(settings: FieldSettings, value: string): FieldSettings {
    const fixedSettings: FieldSettings = { ...settings };
    fixedSettings.Rows ||= 5;
    return fixedSettings;
  }
}

FieldLogicBase.add(CustomJsonEditorLogic);

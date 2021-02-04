import { FieldSettings } from '../../../../../edit-types';
import { InputTypeConstants } from '../../../../../ng-dialogs/src/app/content-type-fields/constants/input-type.constants';
import { FieldLogicBase } from '../../../../field-logic/field-logic-base';

export class StringUrlPathLogic extends FieldLogicBase {
  name = InputTypeConstants.StringUrlPath;

  update(settings: FieldSettings, value: string): FieldSettings {
    const fixedSettings: FieldSettings = { ...settings };
    fixedSettings.AutoGenerateMask ??= null;
    fixedSettings.AllowSlashes ??= false;
    return fixedSettings;
  }
}

FieldLogicBase.add(StringUrlPathLogic);

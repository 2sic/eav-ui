import { FieldSettings } from '../../../../../../../../edit-types';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { FieldLogicBase, FieldLogicUpdate } from '../../../shared/field-logic/field-logic-base';

export class StringUrlPathLogic extends FieldLogicBase {
  name = InputTypeConstants.StringUrlPath;

  update({ settings }: FieldLogicUpdate): FieldSettings {
    const fixedSettings: FieldSettings = { ...settings };
    fixedSettings.AutoGenerateMask ??= null;
    fixedSettings.AllowSlashes ??= false;
    return fixedSettings;
  }
}

FieldLogicBase.add(StringUrlPathLogic);

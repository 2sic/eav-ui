import { FieldLogicBase, FieldLogicUpdate } from '../../logic/field-logic-base';
import { InputTypeConstants } from '../../../../content-type-fields/constants/input-type.constants';
import { FieldSettings } from '../../../../../../../edit-types/src/FieldSettings';

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

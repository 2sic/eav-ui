import { FieldSettings } from '../../../../../../../edit-types';
import { InputTypeConstants } from '../../../../content-type-fields/constants/input-type.constants';
import { FieldLogicBase } from '../../shared/field-logic/field-logic-base';

export class EmptyDefaultLogic extends FieldLogicBase {
  name = InputTypeConstants.EmptyDefault;

  update(settings: FieldSettings): FieldSettings {
    const fixedSettings: FieldSettings = { ...settings };
    fixedSettings.Visible ??= true;
    fixedSettings.Collapsed ??= false;
    fixedSettings.Notes ??= '';
    return fixedSettings;
  }
}

FieldLogicBase.add(EmptyDefaultLogic);

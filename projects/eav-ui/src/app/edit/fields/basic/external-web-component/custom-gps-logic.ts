import { FieldLogicBase, FieldLogicUpdate } from '../../logic/field-logic-base';
import { InputTypeConstants } from '../../../../content-type-fields/constants/input-type.constants';
import { FieldSettings } from '../../../../../../../edit-types/src/FieldSettings';

export class CustomGpsLogic extends FieldLogicBase {
  name = InputTypeConstants.CustomGps;

  update({ settings }: FieldLogicUpdate): FieldSettings {
    const fixedSettings: FieldSettings = { ...settings };
    // fixedSettings.DisableAutoTranslation = true;
    return fixedSettings;
  }
}

FieldLogicBase.add(CustomGpsLogic);

import { FieldLogicBase, FieldLogicUpdate } from '../../logic/field-logic-base';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { FieldSettings } from '../../../../../../../edit-types/src/FieldSettings';

export class CustomGpsLogic extends FieldLogicBase {
  name = InputTypeCatalog.CustomGps;

  constructor() { super({ CustomGpsLogic }); }

  update({ settings }: FieldLogicUpdate): FieldSettings {
    const fixedSettings: FieldSettings = { ...settings };
    // fixedSettings.DisableAutoTranslation = true;
    return fixedSettings;
  }
}

FieldLogicBase.add(CustomGpsLogic);

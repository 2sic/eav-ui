import { FieldSettings } from '../../../../../../../edit-types/src/FieldSettings';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { FieldLogicBase } from '../../logic/field-logic-base';
import { FieldSettingsUpdateTask } from '../../logic/field-settings-update-task';

export class CustomGpsLogic extends FieldLogicBase {
  name = InputTypeCatalog.CustomGps;

  constructor() { super({ CustomGpsLogic }); }

  update({ settings }: FieldSettingsUpdateTask): FieldSettings {
    const fixedSettings: FieldSettings = { ...settings };
    // fixedSettings.DisableAutoTranslation = true;
    return fixedSettings;
  }
}

FieldLogicBase.add(CustomGpsLogic);

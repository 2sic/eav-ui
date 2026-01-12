import { FieldSettings } from '../../../../../../edit-types/src/FieldSettings';
import { InputTypeCatalog } from '../../../shared/fields/input-type-catalog';
import { FieldSettingsHelperBase } from './field-settings-helper-base';
import { FieldSettingsUpdateTask } from './field-settings-update-task';

export class FieldSettingsHelperUnknown extends FieldSettingsHelperBase {
  name = InputTypeCatalog.Unknown;
  
  constructor() { super({FieldSettingsHelperUnknown}); }

  canAutoTranslate = false;

  update({ settings }: FieldSettingsUpdateTask): FieldSettings {
    return settings;
  }
}

// Don't register here, the manager will register it as a fallback
// FieldLogicBase.add(UnknownLogic);


import { FieldSettings } from '../../../../../../edit-types/src/FieldSettings';
import { InputTypeCatalog } from '../../../shared/fields/input-type-catalog';
import { FieldLogicBase } from './field-logic-base';
import { FieldSettingsUpdateTask } from './field-settings-update-task';

export class UnknownLogic extends FieldLogicBase {
  name = InputTypeCatalog.Unknown;
  
  constructor() { super({UnknownLogic}); }

  canAutoTranslate = false;

  update({ settings }: FieldSettingsUpdateTask): FieldSettings {
    return settings;
  }
}

// Don't register here, the manager will register it as a fallback
// FieldLogicBase.add(UnknownLogic);


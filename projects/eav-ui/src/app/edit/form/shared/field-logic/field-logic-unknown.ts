import { InputTypeConstants } from 'projects/eav-ui/src/app/content-type-fields/constants/input-type.constants';
import { FieldLogicBase } from './field-logic-base';
import { FieldSettings } from 'projects/edit-types';

export class UnknownLogic extends FieldLogicBase {
  name = InputTypeConstants.Unknown;

  canAutoTranslate = false;

  update(settings: FieldSettings, _v: unknown, _t: unknown): FieldSettings {
    return settings;
  }
}

// Don't register here, the manager will register it as a fallback
// FieldLogicBase.add(UnknownLogic);


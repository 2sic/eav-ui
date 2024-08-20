import { InputTypeConstants } from '../../../content-type-fields/constants/input-type.constants';
import { FieldLogicBase, FieldLogicUpdate } from './field-logic-base';
import { FieldSettings } from '../../../../../../edit-types/src/FieldSettings';

export class UnknownLogic extends FieldLogicBase {
  name = InputTypeConstants.Unknown;

  canAutoTranslate = false;

  update({ settings }: FieldLogicUpdate): FieldSettings {
    return settings;
  }
}

// Don't register here, the manager will register it as a fallback
// FieldLogicBase.add(UnknownLogic);


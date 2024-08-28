import { InputTypeCatalog } from '../../../shared/fields/input-type-catalog';
import { FieldLogicBase, FieldLogicUpdate } from './field-logic-base';
import { FieldSettings } from '../../../../../../edit-types/src/FieldSettings';

export class UnknownLogic extends FieldLogicBase {
  name = InputTypeCatalog.Unknown;

  canAutoTranslate = false;

  update({ settings }: FieldLogicUpdate): FieldSettings {
    return settings;
  }
}

// Don't register here, the manager will register it as a fallback
// FieldLogicBase.add(UnknownLogic);


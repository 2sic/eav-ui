import { FieldLogicBase, FieldLogicUpdate } from '../../logic/field-logic-base';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { FieldSettings } from '../../../../../../../edit-types/src/FieldSettings';

export class StringUrlPathLogic extends FieldLogicBase {
  name = InputTypeCatalog.StringUrlPath;

  update({ settings }: FieldLogicUpdate): FieldSettings {
    const fixedSettings: FieldSettings = { ...settings };
    fixedSettings.AutoGenerateMask ??= null;
    fixedSettings.AllowSlashes ??= false;
    return fixedSettings;
  }
}

FieldLogicBase.add(StringUrlPathLogic);

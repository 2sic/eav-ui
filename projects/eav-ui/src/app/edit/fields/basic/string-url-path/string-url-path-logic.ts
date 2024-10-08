import { FieldSettings, StringUrlPath } from '../../../../../../../edit-types/src/FieldSettings';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { FieldLogicBase, FieldLogicUpdate } from '../../logic/field-logic-base';

export class StringUrlPathLogic extends FieldLogicBase {
  name = InputTypeCatalog.StringUrlPath;

  constructor() { super({ InputTypeCatalog }); }

  update({ settings }: FieldLogicUpdate): FieldSettings {
    const fixedSettings = { ...settings } as unknown as StringUrlPath;
    fixedSettings.AutoGenerateMask ??= null;
    fixedSettings.AllowSlashes ??= false;
    return fixedSettings as unknown as FieldSettings;
  }
}

FieldLogicBase.add(StringUrlPathLogic);

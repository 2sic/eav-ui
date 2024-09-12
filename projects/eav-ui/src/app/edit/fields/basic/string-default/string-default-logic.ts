import { FieldLogicBase, FieldLogicUpdate } from '../../logic/field-logic-base';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { FieldSettings } from '../../../../../../../edit-types/src/FieldSettings';

export class StringDefaultLogic extends FieldLogicBase {
  name = InputTypeCatalog.StringDefault;

  constructor() { super({ StringDefaultLogic }); }

  canAutoTranslate = true;

  update(specs: FieldLogicUpdate): FieldSettings {
    const fixedSettings: FieldSettings = { ...specs.settings };
    fixedSettings.InputFontFamily ??= '';
    fixedSettings.RowCount ||= 1;
    return fixedSettings;
  }
}

FieldLogicBase.add(StringDefaultLogic);

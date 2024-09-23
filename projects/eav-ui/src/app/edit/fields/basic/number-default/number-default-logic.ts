import { FieldLogicUpdate, FieldLogicBase } from '../../logic/field-logic-base';
import { StringDropdownLogic } from '../string-dropdown/string-dropdown-logic';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { FieldSettings } from '../../../../../../../edit-types/src/FieldSettings';


export class NumberDefaultLogic extends StringDropdownLogic {
  name = InputTypeCatalog.NumberDefault;

  update(specs: FieldLogicUpdate<string>): FieldSettings {
    const fixedSettings: FieldSettings = { ...super.update(specs) };
    // fixedSettings.DisableAutoTranslation = true;
    return fixedSettings;
  }
}

FieldLogicBase.add(NumberDefaultLogic);

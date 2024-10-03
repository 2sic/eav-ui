import { FieldSettings } from '../../../../../../../edit-types/src/FieldSettings';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { FieldLogicBase, FieldLogicUpdate } from '../../logic/field-logic-base';
import { FieldLogicManager } from '../../logic/field-logic-manager';

export class StringDropdownQueryLogic extends FieldLogicBase {
  name = InputTypeCatalog.StringDropdownQuery;

  constructor() { super({ StringDropdownQueryLogic }); }

  update(specs: FieldLogicUpdate<string[]>): FieldSettings {
    const entityDefaultLogic = FieldLogicManager.singleton().get(InputTypeCatalog.EntityDefault);
    const fixedSettings = entityDefaultLogic.update(specs);
    fixedSettings.Value ??= '';
    fixedSettings.Label ??= '';
    fixedSettings.Separator ||= ',';
    fixedSettings.MoreFields ??= '';
    return fixedSettings;
  }
}

FieldLogicBase.add(StringDropdownQueryLogic);

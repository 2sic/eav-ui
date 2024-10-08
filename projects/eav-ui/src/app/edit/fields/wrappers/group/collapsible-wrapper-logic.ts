import { EmptyDefault, FieldSettings } from '../../../../../../../edit-types/src/FieldSettings';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { FieldLogicBase, FieldLogicUpdate } from '../../logic/field-logic-base';

export class EmptyDefaultLogic extends FieldLogicBase {
  name = InputTypeCatalog.EmptyDefault;

  constructor() { super({ EmptyDefaultLogic }); }

  update({ settings }: FieldLogicUpdate): FieldSettings {
    const fixedSettings = { ...settings } as FieldSettings & EmptyDefault;
    fixedSettings.Visible ??= true;
    fixedSettings.Collapsed ??= false;
    fixedSettings.Notes ??= '';
    return fixedSettings;
  }
}

FieldLogicBase.add(EmptyDefaultLogic);

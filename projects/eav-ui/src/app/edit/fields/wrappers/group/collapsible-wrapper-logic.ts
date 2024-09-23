import { FieldSettings } from '../../../../../../../edit-types';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { FieldLogicBase, FieldLogicUpdate } from '../../logic/field-logic-base';

export class EmptyDefaultLogic extends FieldLogicBase {
  name = InputTypeCatalog.EmptyDefault;

  constructor() { super({ EmptyDefaultLogic }); }

  update({ settings }: FieldLogicUpdate): FieldSettings {
    const fixedSettings: FieldSettings = { ...settings };
    fixedSettings.Visible ??= true;
    fixedSettings.Collapsed ??= false;
    fixedSettings.Notes ??= '';
    return fixedSettings;
  }
}

FieldLogicBase.add(EmptyDefaultLogic);

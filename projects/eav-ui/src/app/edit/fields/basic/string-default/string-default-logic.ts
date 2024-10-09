import { FieldSettingsStringDefault } from 'projects/edit-types/src/FieldSettings-String';
import { FieldSettings } from '../../../../../../../edit-types/src/FieldSettings';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { FieldLogicBase, FieldLogicUpdate } from '../../logic/field-logic-base';

export class StringDefaultLogic extends FieldLogicBase {
  name = InputTypeCatalog.StringDefault;

  constructor() { super({ StringDefaultLogic }); }

  canAutoTranslate = true;

  update(specs: FieldLogicUpdate): FieldSettings {
    const fixedSettings = { ...specs.settings } as FieldSettings & FieldSettingsStringDefault;
    fixedSettings.InputFontFamily ??= '';
    fixedSettings.RowCount ||= 1;
    return fixedSettings;
  }
}

FieldLogicBase.add(StringDefaultLogic);

import { FieldSettingsBoolean } from 'projects/edit-types/src/FieldSettings-Boolean';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { FieldLogicBase, FieldLogicUpdate } from '../../logic/field-logic-base';
import { FieldSettings } from './../../../../../../../edit-types/src/FieldSettings';

export class BooleanTristateLogic extends FieldLogicBase {
  name = InputTypeCatalog.BooleanTristate;

  constructor() { super({ BooleanTristateLogic }); }

  update({ settings, value }: FieldLogicUpdate<boolean | ''>): FieldSettings {
    const fixedSettings = { ...settings } as FieldSettings & FieldSettingsBoolean;
    fixedSettings.ReverseToggle ??= false;
    fixedSettings._label = this.#calculateLabel(value, fixedSettings);
    // fixedSettings.DisableAutoTranslation = true;
    return fixedSettings;
  }

  #calculateLabel(value: boolean | '', settings: FieldSettings & FieldSettingsBoolean): string {
    if (value === true && settings.TitleTrue)
      return settings.TitleTrue;
    if (value === false && settings.TitleFalse)
      return settings.TitleFalse;
    if (!value /* null | '' */ && settings.TitleIndeterminate)
      return settings.TitleIndeterminate;
    return settings.Name;
  }
}

FieldLogicBase.add(BooleanTristateLogic);

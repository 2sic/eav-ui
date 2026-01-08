import { FieldSettingsBoolean } from 'projects/edit-types/src/FieldSettings-Boolean';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { FieldLogicBase } from '../../logic/field-logic-base';
import { FieldSettingsUpdateTask } from '../../logic/field-settings-update-task';
import { FieldSettings } from './../../../../../../../edit-types/src/FieldSettings';

export class BooleanDefaultLogic extends FieldLogicBase {
  name = InputTypeCatalog.BooleanDefault;

  constructor() { super({ BooleanDefaultLogic }); }

  update({ settings, value }: FieldSettingsUpdateTask<boolean>): FieldSettings {
    const fixedSettings = { ...settings } as FieldSettings & FieldSettingsBoolean;
    fixedSettings.ReverseToggle ??= false;
    fixedSettings._label = this.#calculateLabel(value, fixedSettings);
    // fixedSettings.DisableAutoTranslation = true;
    return fixedSettings;
  }

  #calculateLabel(value: boolean, settings: FieldSettings & FieldSettingsBoolean): string {
    if (value === true && settings.TitleTrue)
      return settings.TitleTrue;
    if (value === false && settings.TitleFalse)
      return settings.TitleFalse;
    return settings.Name;
  }
}

FieldLogicBase.add(BooleanDefaultLogic);

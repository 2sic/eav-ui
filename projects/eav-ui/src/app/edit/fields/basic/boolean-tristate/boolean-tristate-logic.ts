import { FieldSettings } from './../../../../../../../edit-types/src/FieldSettings';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { FieldLogicBase, FieldLogicUpdate } from '../../logic/field-logic-base';

export class BooleanTristateLogic extends FieldLogicBase {
  name = InputTypeCatalog.BooleanTristate;

  constructor() { super({ BooleanTristateLogic }); }

  update({ settings, value }: FieldLogicUpdate<boolean | ''>): FieldSettings {
    const fixedSettings: FieldSettings = { ...settings };
    fixedSettings.ReverseToggle ??= false;
    fixedSettings._label = this.calculateLabel(value, fixedSettings);
    // fixedSettings.DisableAutoTranslation = true;
    return fixedSettings;
  }

  private calculateLabel(value: boolean | '', settings: FieldSettings): string {
    if (value === true && settings.TitleTrue != null && settings.TitleTrue !== '') {
      return settings.TitleTrue;
    }
    if (value === false && settings.TitleFalse != null && settings.TitleFalse !== '') {
      return settings.TitleFalse;
    }
    if (value === null && settings.TitleIndeterminate != null && settings.TitleIndeterminate !== '') {
      return settings.TitleIndeterminate;
    }
    return settings.Name;
  }
}

FieldLogicBase.add(BooleanTristateLogic);

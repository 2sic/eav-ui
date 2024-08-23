import { FieldSettings } from './../../../../../../../edit-types/src/FieldSettings';
import { FieldLogicBase, FieldLogicUpdate } from '../../logic/field-logic-base';
import { InputTypeConstants } from '../../../../content-type-fields/constants/input-type.constants';

export class BooleanDefaultLogic extends FieldLogicBase {
  name = InputTypeConstants.BooleanDefault;

  update({ settings, value }: FieldLogicUpdate<boolean>): FieldSettings {
    const fixedSettings: FieldSettings = { ...settings };
    fixedSettings.ReverseToggle ??= false;
    fixedSettings._label = this.calculateLabel(value, fixedSettings);
    // fixedSettings.DisableAutoTranslation = true;
    return fixedSettings;
  }

  private calculateLabel(value: boolean, settings: FieldSettings): string {
    if (value === true && settings.TitleTrue != null && settings.TitleTrue !== '') {
      return settings.TitleTrue;
    }
    if (value === false && settings.TitleFalse != null && settings.TitleFalse !== '') {
      return settings.TitleFalse;
    }
    return settings.Name;
  }
}

FieldLogicBase.add(BooleanDefaultLogic);
import { FieldSettings } from '../../../../../edit-types';
import { InputTypeConstants } from '../../../../../ng-dialogs/src/app/content-type-fields/constants/input-type.constants';
import { FieldLogicBase } from '../../../shared/field-logic/field-logic-base';

export class BooleanDefaultLogic extends FieldLogicBase {
  name = InputTypeConstants.BooleanDefault;

  update(settings: FieldSettings, value: boolean): FieldSettings {
    const fixedSettings: FieldSettings = { ...settings };
    fixedSettings.ReverseToggle ??= false;
    fixedSettings._label = this.calculateLabel(value, fixedSettings);
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

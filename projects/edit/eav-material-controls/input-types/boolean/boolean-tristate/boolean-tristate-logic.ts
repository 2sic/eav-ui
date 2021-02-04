import { FieldSettings } from '../../../../../edit-types';
import { InputTypeConstants } from '../../../../../ng-dialogs/src/app/content-type-fields/constants/input-type.constants';
import { FieldLogicBase } from '../../../../field-logic/field-logic-base';

export class BooleanTristateLogic extends FieldLogicBase {
  name = InputTypeConstants.BooleanTristate;

  public update(settings: FieldSettings, value: boolean | ''): FieldSettings {
    const fixedSettings: FieldSettings = { ...settings };
    fixedSettings._label = this.calculateLabel(value, fixedSettings);
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

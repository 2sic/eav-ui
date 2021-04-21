import { FieldSettings } from '../../../../edit-types';
import { InputTypeConstants } from '../../../../ng-dialogs/src/app/content-type-fields/constants/input-type.constants';
import { FieldLogicBase } from '../../../field-logic/field-logic-base';

export class EmptyDefaultLogic extends FieldLogicBase {
  name = InputTypeConstants.EmptyDefault;

  update(settings: FieldSettings, value: undefined): FieldSettings {
    const fixedSettings: FieldSettings = { ...settings };
    fixedSettings.VisibleInEditUI ??= true;
    fixedSettings.DefaultCollapsed ??= false;
    fixedSettings.Notes ??= '';
    return fixedSettings;
  }
}

FieldLogicBase.add(EmptyDefaultLogic);

import { FieldSettings } from '../../../../../edit-types';
import { InputTypeConstants } from '../../../../../ng-dialogs/src/app/content-type-fields/constants/input-type.constants';
import { FieldLogicBase } from '../../../shared/field-logic/field-logic-base';

export class EntityDefaultLogic extends FieldLogicBase {
  name = InputTypeConstants.EntityDefault;

  update(settings: FieldSettings, value: string[]): FieldSettings {
    const fixedSettings: FieldSettings = { ...settings };
    fixedSettings.EntityType ??= '';
    fixedSettings.AllowMultiValue ??= false;
    fixedSettings.EnableEdit ??= true;
    fixedSettings.EnableCreate ??= true;
    fixedSettings.EnableAddExisting ??= true;
    fixedSettings.EnableRemove ??= true;
    fixedSettings.EnableDelete ??= false;
    return fixedSettings;
  }
}

FieldLogicBase.add(EntityDefaultLogic);

import { FieldSettings } from '../../../../../edit-types';
import { InputTypeConstants } from '../../../../../ng-dialogs/src/app/content-type-fields/constants/input-type.constants';
import { EavConfig } from '../../../../shared/models';
import { FieldLogicBase } from '../../../shared/field-logic/field-logic-base';

export class EntityDefaultLogic extends FieldLogicBase {
  name = InputTypeConstants.EntityDefault;

  update(settings: FieldSettings, value: string[], eavConfig: EavConfig, debugEnabled: boolean): FieldSettings {
    const fixedSettings: FieldSettings = { ...settings };
    fixedSettings.EntityType ??= '';
    fixedSettings.AllowMultiValue ??= false;
    fixedSettings.EnableEdit ??= true;
    fixedSettings.EnableCreate ??= true;
    fixedSettings.EnableAddExisting ??= true;
    fixedSettings.EnableRemove ??= true;
    fixedSettings.EnableDelete ??= false;

    if (eavConfig.overrideEditRestrictions && debugEnabled) {
      fixedSettings.EnableEdit = true;
      fixedSettings.EnableCreate = true;
      fixedSettings.EnableAddExisting = true;
      fixedSettings.EnableRemove = true;
      fixedSettings.EnableDelete = true;
    }
    return fixedSettings;
  }
}

FieldLogicBase.add(EntityDefaultLogic);

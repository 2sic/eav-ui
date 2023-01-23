import { FieldSettings } from '../../../../../../../../edit-types';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { FieldLogicBase } from '../../../shared/field-logic/field-logic-base';
import { FieldLogicTools } from '../../../shared/field-logic/field-logic-tools';

export class EntityDefaultLogic extends FieldLogicBase {
  name = InputTypeConstants.EntityDefault;

  update(settings: FieldSettings, value: string[], tools: FieldLogicTools): FieldSettings {
    const fixedSettings: FieldSettings = { ...settings };
    fixedSettings.EntityType ??= '';
    fixedSettings.AllowMultiValue ??= false;
    fixedSettings.EnableEdit ??= true;
    fixedSettings.EnableCreate ??= true;
    fixedSettings.EnableAddExisting ??= true;
    fixedSettings.EnableRemove ??= true;
    fixedSettings.EnableDelete ??= false;
    // 2dm 2023-01-22 #maybeSupportIncludeParentApps
    // fixedSettings.IncludeParentApps ??= false;

    if (tools.eavConfig.overrideEditRestrictions && tools.debug) {
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

import { FieldSettings } from '../../../../../../../../edit-types';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { FieldLogicBase } from '../../../shared/field-logic/field-logic-base';
import { FieldLogicTools } from '../../../shared/field-logic/field-logic-tools';

export class EntityDefaultLogic extends FieldLogicBase {
  name = InputTypeConstants.EntityDefault;

  update(settings: FieldSettings, value: string[], tools: FieldLogicTools): FieldSettings {
    
    const fixedSettings = EntityDefaultLogic.setDefaultSettings({ ...settings });
    
    fixedSettings.EntityType ??= '';
    fixedSettings.CreateTypes = fixedSettings.EntityType;
    fixedSettings.MoreFields ??= '';

    if (tools.eavConfig.overrideEditRestrictions && tools.debug) {
      // tslint:disable-next-line: max-line-length
      console.log('SystemAdmin + Debug: Overriding edit restrictions for field \'' + settings.Name + '\' (EntityType: \'' + settings.EntityType + '\').');
      fixedSettings.EnableEdit = true;
      fixedSettings.EnableCreate = true;
      fixedSettings.EnableAddExisting = true;
      fixedSettings.EnableRemove = true;
      fixedSettings.EnableDelete = true;
    }

    return fixedSettings;
  }

  static setDefaultSettings(settings: FieldSettings): FieldSettings {
    settings.AllowMultiValue ??= false;
    settings.EnableEdit ??= true;
    settings.EnableCreate ??= true;
    settings.EnableAddExisting ??= true;
    settings.EnableRemove ??= true;
    settings.EnableDelete ??= false;
    settings.Label ??= '';
    return settings;
  }
}

FieldLogicBase.add(EntityDefaultLogic);

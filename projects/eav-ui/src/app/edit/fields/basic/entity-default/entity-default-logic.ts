import { FieldSettings } from './../../../../../../../edit-types/src/FieldSettings';
import { InputTypeConstants } from './../../../../content-type-fields/constants/input-type.constants';
import { FieldLogicBase, FieldLogicUpdate } from '../../logic/field-logic-base';
import { EntityPickerLogic } from '../entity-picker/entity-picker-logic';

export class EntityDefaultLogic extends FieldLogicBase {
  name = InputTypeConstants.EntityDefault;

  update({ settings, tools }: FieldLogicUpdate): FieldSettings {
    
    let fs = EntityDefaultLogic.setDefaultSettings({ ...settings });
    
    fs.EntityType ??= '';
    fs.CreateTypes = fs.EntityType;
    fs.MoreFields ??= '';

    fs = EntityPickerLogic.maybeOverrideEditRestrictions(fs, tools);
    
    return fs;
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

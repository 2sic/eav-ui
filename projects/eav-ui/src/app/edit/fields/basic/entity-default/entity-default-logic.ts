import { PickerSourceEntity } from 'projects/edit-types/src/PickerSources';
import { FieldSettingsEntity, FieldSettingsSharedCreate } from '../../../../../../../edit-types/src/FieldSettings-Pickers';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { FieldLogicBase, FieldLogicUpdate } from '../../logic/field-logic-base';
import { PickerLogicShared } from '../../picker/picker-logic-shared';
import { FieldSettings } from './../../../../../../../edit-types/src/FieldSettings';

export class EntityDefaultLogic extends FieldLogicBase {
  name = InputTypeCatalog.EntityDefault;
  
  constructor() { super({ EntityDefaultLogic }); }

  update({ settings, tools }: FieldLogicUpdate): FieldSettings {
    
    const fsRaw = PickerLogicShared.setDefaultSettings({ ...settings }) as FieldSettings & FieldSettingsSharedCreate & FieldSettingsEntity;
    
    // Both the query type and create-type are the same
    fsRaw.EntityType ??= '';
    fsRaw.CreateTypes = fsRaw.EntityType ?? '';

    // The old entity-type has a prefill, which is now the create-prefill
    (fsRaw as unknown as PickerSourceEntity).CreatePrefill ??= fsRaw.Prefill;
    delete fsRaw.Prefill;

    const fs = PickerLogicShared.maybeOverrideEditRestrictions(fsRaw, tools).fs;
    
    return fs;
  }

}

FieldLogicBase.add(EntityDefaultLogic);

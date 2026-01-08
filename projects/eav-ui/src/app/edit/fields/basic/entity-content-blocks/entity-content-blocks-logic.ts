import { FieldSettings } from '../../../../../../../edit-types/src/FieldSettings';
import { FieldSettingsPickerMerged } from '../../../../../../../edit-types/src/FieldSettings-Pickers';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { FieldLogicBase } from '../../logic/field-settings-helper-base';
import { FieldSettingsHelpersManager } from '../../logic/field-settings-helpers-manager';
import { FieldSettingsUpdateTask } from '../../logic/field-settings-update-task';

export class EntityContentBlocksLogic extends FieldLogicBase {
  name = InputTypeCatalog.EntityContentBlocks;

  constructor() { super({ EntityContentBlocksLogic }); }

  update(specs: FieldSettingsUpdateTask<string[]>): FieldSettings {
    const entityDefaultLogic = FieldSettingsHelpersManager.singleton().get(InputTypeCatalog.EntityDefault);
    const fs = entityDefaultLogic.update(specs)  as FieldSettings & FieldSettingsPickerMerged;
    fs.EnableRemove = true;
    fs.AllowMultiValue = true;
    fs.EnableAddExisting = false;
    fs.EnableCreate = false;
    fs.EnableEdit = false;
    fs.Visible = false;

    // Both the query type and create-type are the same
    fs.EntityType = 'ContentGroupReference';
    fs.CreateTypes = fs.EntityType;

    return fs;
  }
}

FieldLogicBase.add(EntityContentBlocksLogic);

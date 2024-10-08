import { FieldSettings, FieldSettingsPickerMerged } from '../../../../../../../edit-types/src/FieldSettings';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { FieldLogicBase, FieldLogicUpdate } from '../../logic/field-logic-base';
import { FieldLogicManager } from '../../logic/field-logic-manager';

export class EntityContentBlocksLogic extends FieldLogicBase {
  name = InputTypeCatalog.EntityContentBlocks;

  constructor() { super({ EntityContentBlocksLogic }); }

  update(specs: FieldLogicUpdate<string[]>): FieldSettings {
    const entityDefaultLogic = FieldLogicManager.singleton().get(InputTypeCatalog.EntityDefault);
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

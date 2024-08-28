import { FieldLogicBase, FieldLogicUpdate } from '../../logic/field-logic-base';
import { FieldLogicManager } from '../../logic/field-logic-manager';
import { FieldSettings } from '../../../../../../../edit-types/src/FieldSettings';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';

export class EntityContentBlocksLogic extends FieldLogicBase {
  name = InputTypeCatalog.EntityContentBlocks;

  update(specs: FieldLogicUpdate<string[]>): FieldSettings {
    const entityDefaultLogic = FieldLogicManager.singleton().get(InputTypeCatalog.EntityDefault);
    const fixedSettings = entityDefaultLogic.update(specs);
    fixedSettings.EnableRemove = true;
    fixedSettings.AllowMultiValue = true;
    fixedSettings.EnableAddExisting = false;
    fixedSettings.EnableCreate = false;
    fixedSettings.EnableEdit = false;
    fixedSettings.EntityType = 'ContentGroupReference';
    fixedSettings.CreateTypes = fixedSettings.EntityType;
    fixedSettings.Visible = false;
    return fixedSettings;
  }
}

FieldLogicBase.add(EntityContentBlocksLogic);

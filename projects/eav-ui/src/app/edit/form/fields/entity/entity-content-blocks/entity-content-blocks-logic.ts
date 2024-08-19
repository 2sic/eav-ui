import { FieldSettings } from '../../../../../../../../edit-types';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { FieldLogicBase, FieldLogicUpdate } from '../../../shared/field-logic/field-logic-base';
import { FieldLogicManager } from '../../../shared/field-logic/field-logic-manager';

export class EntityContentBlocksLogic extends FieldLogicBase {
  name = InputTypeConstants.EntityContentBlocks;

  update(specs: FieldLogicUpdate<string[]>): FieldSettings {
    const entityDefaultLogic = FieldLogicManager.singleton().get(InputTypeConstants.EntityDefault);
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

import { FieldSettings } from '../../../../../../../../edit-types';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { EavConfig } from '../../../../shared/models';
import { FieldLogicBase } from '../../../shared/field-logic/field-logic-base';
import { FieldLogicManager } from '../../../shared/field-logic/field-logic-manager';

export class EntityContentBlocksLogic extends FieldLogicBase {
  name = InputTypeConstants.EntityContentBlocks;

  update(settings: FieldSettings, value: string[], eavConfig: EavConfig, debugEnabled: boolean): FieldSettings {
    const entityDefaultLogic = FieldLogicManager.singleton().get(InputTypeConstants.EntityDefault);
    const fixedSettings = entityDefaultLogic.update(settings, value, eavConfig, debugEnabled);
    fixedSettings.EnableRemove = true;
    fixedSettings.AllowMultiValue = true;
    fixedSettings.EnableAddExisting = false;
    fixedSettings.EnableCreate = false;
    fixedSettings.EnableEdit = false;
    fixedSettings.EntityType = 'ContentGroupReference';
    fixedSettings.Visible = false;
    return fixedSettings;
  }
}

FieldLogicBase.add(EntityContentBlocksLogic);

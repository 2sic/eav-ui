import { FieldSettings } from '../../../../../edit-types';
import { InputTypeConstants } from '../../../../../ng-dialogs/src/app/content-type-fields/constants/input-type.constants';
import { FieldLogicBase } from '../../../../field-logic/field-logic-base';
import { FieldLogicManager } from '../../../../field-logic/field-logic-manager';
import { EntityDefaultLogic } from '../entity-default/entity-default-logic';

export class EntityContentBlocksLogic extends EntityDefaultLogic {
  constructor() {
    super();
  }

  init(settings: FieldSettings): FieldSettings {
    const fixedSettings = super.init(settings);
    fixedSettings.AllowMultiValue = false;
    fixedSettings.EnableRemove = true;
    fixedSettings.AllowMultiValue = true;
    fixedSettings.EnableAddExisting = false;
    fixedSettings.EnableCreate = false;
    fixedSettings.EnableEdit = false;
    fixedSettings.EntityType = 'ContentGroupReference';
    fixedSettings.VisibleInEditUI = false;
    return fixedSettings;
  }
}

export class EntityContentBlocksLogic2 extends FieldLogicBase {
  name: string;

  constructor() {
    super();
    this.name = InputTypeConstants.EntityContentBlocks;
    FieldLogicManager.singleton().add(this);
  }

  update(settings: FieldSettings, value: string[]): FieldSettings {
    const entityDefaultLogic = FieldLogicManager.singleton().get(InputTypeConstants.EntityDefault);
    const fixedSettings = entityDefaultLogic.update(settings, value);
    fixedSettings.AllowMultiValue = false;
    fixedSettings.EnableRemove = true;
    fixedSettings.AllowMultiValue = true;
    fixedSettings.EnableAddExisting = false;
    fixedSettings.EnableCreate = false;
    fixedSettings.EnableEdit = false;
    fixedSettings.EntityType = 'ContentGroupReference';
    fixedSettings.VisibleInEditUI = false;
    return fixedSettings;
  }
}

const any = new EntityContentBlocksLogic2();

import { FieldSettings } from '../../../../../edit-types';
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

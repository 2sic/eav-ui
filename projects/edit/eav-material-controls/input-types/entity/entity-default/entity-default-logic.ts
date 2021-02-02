import { FieldSettings } from '../../../../../edit-types';
import { InputTypeConstants } from '../../../../../ng-dialogs/src/app/content-type-fields/constants/input-type.constants';
import { FieldLogicBase } from '../../../../field-logic/field-logic-base';
import { FieldLogicManager } from '../../../../field-logic/field-logic-manager';

export class EntityDefaultLogic {
  constructor() { }

  init(settings: FieldSettings): FieldSettings {
    const fixedSettings: FieldSettings = { ...settings };
    if (fixedSettings.EntityType == null) { fixedSettings.EntityType = ''; }
    if (fixedSettings.AllowMultiValue == null) { fixedSettings.AllowMultiValue = false; }
    if (fixedSettings.EnableEdit == null) { fixedSettings.EnableEdit = true; }
    if (fixedSettings.EnableCreate == null) { fixedSettings.EnableCreate = true; }
    if (fixedSettings.EnableAddExisting == null) { fixedSettings.EnableAddExisting = true; }
    if (fixedSettings.EnableRemove == null) { fixedSettings.EnableRemove = true; }
    if (fixedSettings.EnableDelete == null) { fixedSettings.EnableDelete = false; }
    return fixedSettings;
  }
}

export class EntityDefaultLogic2 extends FieldLogicBase {
  name: string;

  constructor() {
    super();
    this.name = InputTypeConstants.EntityDefault;
    FieldLogicManager.singleton().add(this);
  }

  init(settings: FieldSettings): FieldSettings {
    const fixedSettings: FieldSettings = { ...settings };
    fixedSettings.EntityType ??= '';
    fixedSettings.AllowMultiValue ??= false;
    fixedSettings.EnableEdit ??= true;
    fixedSettings.EnableCreate ??= true;
    fixedSettings.EnableAddExisting ??= true;
    fixedSettings.EnableRemove ??= true;
    fixedSettings.EnableDelete ??= false;
    return fixedSettings;
  }
}

const any = new EntityDefaultLogic2();

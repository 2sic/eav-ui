import { FieldSettings } from '../../../../edit-types';
import { InputTypeConstants } from '../../../../ng-dialogs/src/app/content-type-fields/constants/input-type.constants';
import { FieldLogicBase } from '../../../field-logic/field-logic-base';
import { FieldLogicManager } from '../../../field-logic/field-logic-manager';

export class CollapsibleWrapperLogic {
  constructor() { }

  init(settings: FieldSettings): FieldSettings {
    const fixedSettings: FieldSettings = { ...settings };
    if (fixedSettings.VisibleInEditUI == null) { fixedSettings.VisibleInEditUI = true; }
    if (fixedSettings.DefaultCollapsed == null) { fixedSettings.DefaultCollapsed = false; }
    if (fixedSettings.Notes == null) { fixedSettings.Notes = ''; }
    return fixedSettings;
  }
}

export class EmptyDefaultLogic2 extends FieldLogicBase {
  name: string;

  constructor() {
    super();
    this.name = InputTypeConstants.EmptyDefault;
    FieldLogicManager.singleton().add(this);
  }

  update(settings: FieldSettings, value: undefined): FieldSettings {
    const fixedSettings: FieldSettings = { ...settings };
    fixedSettings.VisibleInEditUI ??= true;
    fixedSettings.DefaultCollapsed ??= false;
    fixedSettings.Notes ??= '';
    return fixedSettings;
  }
}

const any = new EmptyDefaultLogic2();

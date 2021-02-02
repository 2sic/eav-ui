import { FieldSettings } from '../../../../../edit-types';
import { FieldLogicBase } from '../../../../field-logic/field-logic-base';
import { FieldLogicManager } from '../../../../field-logic/field-logic-manager';

export class StringDefaultLogic {
  constructor() { }

  init(settings: FieldSettings): FieldSettings {
    const fixedSettings: FieldSettings = { ...settings };
    fixedSettings.RowCount ||= 1;
    return fixedSettings;
  }
}

export class StringDefaultLogicNew extends FieldLogicBase {
  name: string;

  constructor() {
    super();
    this.name = 'string-default';
    FieldLogicManager.singleton().add(this);
  }

  init(settings: FieldSettings): FieldSettings {
    const fixedSettings: FieldSettings = { ...settings };
    fixedSettings.RowCount ||= 1;
    return fixedSettings;
  }
}

const any = new StringDefaultLogicNew();

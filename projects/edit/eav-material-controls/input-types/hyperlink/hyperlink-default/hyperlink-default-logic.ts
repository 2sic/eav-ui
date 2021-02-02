import { FieldSettings } from '../../../../../edit-types';
import { InputTypeConstants } from '../../../../../ng-dialogs/src/app/content-type-fields/constants/input-type.constants';
import { FieldLogicBase } from '../../../../field-logic/field-logic-base';
import { FieldLogicManager } from '../../../../field-logic/field-logic-manager';

export class HyperlinkDefaultLogic {
  constructor() { }

  init(settings: FieldSettings): FieldSettings {
    const fixedSettings: FieldSettings = { ...settings };
    fixedSettings.Buttons ||= 'adam,more';
    fixedSettings.FileFilter ||= '';
    fixedSettings.Paths ||= '';
    return fixedSettings;
  }
}

export class HyperlinkDefaultLogic2 extends FieldLogicBase {
  name: string;

  constructor() {
    super();
    this.name = InputTypeConstants.HyperlinkDefault;
    FieldLogicManager.singleton().add(this);
  }

  init(settings: FieldSettings): FieldSettings {
    const fixedSettings: FieldSettings = { ...settings };
    fixedSettings.Buttons ||= 'adam,more';
    fixedSettings.FileFilter ??= '';
    fixedSettings.Paths ??= '';
    return fixedSettings;
  }
}

const any = new HyperlinkDefaultLogic2();

import { FieldSettings } from '../../../../../edit-types';
import { InputTypeConstants } from '../../../../../ng-dialogs/src/app/content-type-fields/constants/input-type.constants';
import { FieldLogicBase } from '../../../../field-logic/field-logic-base';
import { FieldLogicManager } from '../../../../field-logic/field-logic-manager';

export class StringFontIconPickerLogic {
  constructor() { }

  init(settings: FieldSettings): FieldSettings {
    const fixedSettings: FieldSettings = { ...settings };
    fixedSettings.Files ||= '';
    fixedSettings.CssPrefix ||= '';
    fixedSettings.ShowPrefix ||= false;
    return fixedSettings;
  }
}

export class StringFontIconPickerLogic2 extends FieldLogicBase {
  name: string;

  constructor() {
    super();
    this.name = InputTypeConstants.StringFontIconPicker;
    FieldLogicManager.singleton().add(this);
  }

  init(settings: FieldSettings): FieldSettings {
    const fixedSettings: FieldSettings = { ...settings };
    fixedSettings.Files ??= '';
    fixedSettings.CssPrefix ??= '';
    fixedSettings.ShowPrefix ??= false;
    return fixedSettings;
  }
}

const any = new StringFontIconPickerLogic2();

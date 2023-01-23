import { FieldSettings } from '../../../../../../../../edit-types';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { FieldLogicBase } from '../../../shared/field-logic/field-logic-base';

export class HyperlinkLibraryLogic extends FieldLogicBase {
  name = InputTypeConstants.HyperlinkLibrary;

  update(settings: FieldSettings): FieldSettings {
    const fixedSettings: FieldSettings = { ...settings };
    fixedSettings.EnableImageConfiguration ??= true; // 2022-11-08 v14.12 changed default to true // false;
    return fixedSettings;
  }
}

FieldLogicBase.add(HyperlinkLibraryLogic);

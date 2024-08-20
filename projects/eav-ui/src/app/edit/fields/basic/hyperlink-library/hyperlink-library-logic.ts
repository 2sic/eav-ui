import { FieldLogicBase, FieldLogicUpdate } from '../../logic/field-logic-base';
import { InputTypeConstants } from '../../../../content-type-fields/constants/input-type.constants';
import { FieldSettings } from '../../../../../../../edit-types/src/FieldSettings';

export class HyperlinkLibraryLogic extends FieldLogicBase {
  name = InputTypeConstants.HyperlinkLibrary;

  update({ settings }: FieldLogicUpdate): FieldSettings {
    const fixedSettings: FieldSettings = { ...settings };
    fixedSettings.EnableImageConfiguration ??= true; // 2022-11-08 v14.12 changed default to true // false;
    return fixedSettings;
  }
}

FieldLogicBase.add(HyperlinkLibraryLogic);

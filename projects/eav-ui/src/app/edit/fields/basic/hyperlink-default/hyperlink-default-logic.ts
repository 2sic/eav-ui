import { FieldLogicBase, FieldLogicUpdate } from '../../logic/field-logic-base';
import { InputTypeConstants } from '../../../../content-type-fields/constants/input-type.constants';
import { FieldSettings } from '../../../../../../../edit-types/src/FieldSettings';

export class HyperlinkDefaultLogic extends FieldLogicBase {
  name = InputTypeConstants.HyperlinkDefault;

  update({ settings }: FieldLogicUpdate): FieldSettings {
    const fixedSettings: FieldSettings = { ...settings };
    fixedSettings.Buttons ||= 'adam,more';
    fixedSettings.FileFilter ??= '';
    fixedSettings.Paths ??= '';
    fixedSettings.ServerResourceMapping ??= '';
    fixedSettings.EnableImageConfiguration ??= true; // 2022-11-08 v14.12 changed default to true // false;
    return fixedSettings;
  }
}

FieldLogicBase.add(HyperlinkDefaultLogic);

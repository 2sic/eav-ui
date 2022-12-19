import { FieldSettings } from '../../../../../../../../edit-types';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { FieldLogicBase } from '../../../shared/field-logic/field-logic-base';

export class HyperlinkDefaultLogic extends FieldLogicBase {
  name = InputTypeConstants.HyperlinkDefault;

  update(settings: FieldSettings, value: string): FieldSettings {
    const fixedSettings: FieldSettings = { ...settings };
    fixedSettings.Buttons ||= 'adam,more';
    fixedSettings.FileFilter ??= '';
    fixedSettings.Paths ??= '';
    fixedSettings.ServerResourceMapping ??= '';
    fixedSettings.EnableImageConfiguration ??= false;
    fixedSettings.DisableAutoTranslation = true;
    return fixedSettings;
  }
}

FieldLogicBase.add(HyperlinkDefaultLogic);

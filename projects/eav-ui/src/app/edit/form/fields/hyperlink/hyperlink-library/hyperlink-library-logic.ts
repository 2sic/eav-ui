import { FieldSettings } from '../../../../../../../../edit-types';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { FieldLogicBase } from '../../../shared/field-logic/field-logic-base';

export class HyperlinkLibraryLogic extends FieldLogicBase {
  name = InputTypeConstants.HyperlinkLibrary;

  update(settings: FieldSettings, value: undefined): FieldSettings {
    const fixedSettings: FieldSettings = { ...settings };
    fixedSettings.EnableImageConfiguration ??= false;
    fixedSettings.DisableAutoTranslation = true;
    return fixedSettings;
  }
}

FieldLogicBase.add(HyperlinkLibraryLogic);

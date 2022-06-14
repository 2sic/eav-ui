import { FieldSettings } from '../../../../../../../../edit-types';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { FieldLogicBase } from '../../../shared/field-logic/field-logic-base';

export class StringWysiwygLogic extends FieldLogicBase {
  name = InputTypeConstants.StringWysiwyg;

  update(settings: FieldSettings, value: string): FieldSettings {
    const fixedSettings: FieldSettings = { ...settings };
    fixedSettings.Dialog ||= 'inline';
    fixedSettings.ButtonSource ||= '';
    fixedSettings.ButtonAdvanced ||= '';
    fixedSettings.ContentCss ||= '';
    fixedSettings.InlineInitialHeight ||= '3';
    return fixedSettings;
  }
}

FieldLogicBase.add(StringWysiwygLogic);

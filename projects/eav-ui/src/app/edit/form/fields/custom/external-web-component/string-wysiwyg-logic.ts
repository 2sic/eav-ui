import { FieldSettings, StringWysiwyg } from '../../../../../../../../edit-types';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { FieldLogicBase } from '../../../shared/field-logic/field-logic-base';
import { FieldLogicTools } from '../../../shared/field-logic/field-logic-tools';

export class StringWysiwygLogic extends FieldLogicBase {
  name = InputTypeConstants.StringWysiwyg;

  canAutoTranslate = true;

  update(settings: StringWysiwyg, _: unknown, tools: FieldLogicTools): FieldSettings {
    const fixedSettings: StringWysiwyg = { ...settings };
    // If the `Dialog` setting is blank, it means start inline (default) and allow switching to dialog.
    fixedSettings._allowDialog = fixedSettings.Dialog == null || fixedSettings.Dialog === '';
    fixedSettings.Dialog ||= 'inline';
    fixedSettings.ButtonSource ||= '';
    fixedSettings.ButtonAdvanced ||= '';
    fixedSettings.ContentCss ||= '';
    fixedSettings.InlineInitialHeight ||= '3';

    // New - configuration bundles
    fixedSettings._advanced = this.findAndMergeAdvanced(tools, fixedSettings.WysiwygConfiguration, {
      Mode: 'default',
      Json: '',
    });
    return fixedSettings as FieldSettings;
  }
}

FieldLogicBase.add(StringWysiwygLogic);


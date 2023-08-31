import { FieldSettings, FieldValue, StringWysiwyg } from '../../../../../../../../edit-types';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { FieldLogicBase } from '../../../shared/field-logic/field-logic-base';
import { FieldLogicTools } from '../../../shared/field-logic/field-logic-tools';

export class StringWysiwygLogic extends FieldLogicBase {
  name = InputTypeConstants.StringWysiwyg;

  canAutoTranslate = true;

  update(settings: StringWysiwyg, value: FieldValue, tools: FieldLogicTools): FieldSettings {
    const fixedSettings: StringWysiwyg = { ...settings };
    // If the `Dialog` setting is blank, it means start inline (default) and allow switching to dialog.
    fixedSettings._allowDialog ??= fixedSettings.Dialog == null || fixedSettings.Dialog === '';
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

    // If mode is "rich" we may have to fix some image URLs
    if (fixedSettings._advanced.Mode === 'rich') {
      var fixed = this.fixImageUrls(value, tools);
    }

    return fixedSettings as FieldSettings;
  }

  private fixImageUrls(value: FieldValue, tools: FieldLogicTools): FieldValue {
    if (typeof value !== 'string') return value;
    if (value.indexOf('data-cmsid="file:') < 0) return value;
    console.log('2dm - found cmsid in wysiwyg value', value);
    return value;
  }
}

FieldLogicBase.add(StringWysiwygLogic);


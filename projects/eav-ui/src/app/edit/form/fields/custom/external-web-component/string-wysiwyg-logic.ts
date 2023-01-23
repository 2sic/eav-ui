import { FieldSettings } from '../../../../../../../../edit-types';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { FieldLogicBase } from '../../../shared/field-logic/field-logic-base';
import { FieldLogicTools } from '../../../shared/field-logic/field-logic-tools';

export class StringWysiwygLogic extends FieldLogicBase {
  name = InputTypeConstants.StringWysiwyg;

  canAutoTranslate = true;

  update(settings: FieldSettings, value: string, tools: FieldLogicTools): FieldSettings {
    const fixedSettings: FieldSettings = { ...settings };
    fixedSettings.Dialog ||= 'inline';
    fixedSettings.ButtonSource ||= '';
    fixedSettings.ButtonAdvanced ||= '';
    fixedSettings.ContentCss ||= '';
    fixedSettings.InlineInitialHeight ||= '3';
    fixedSettings.WysiwygMode ||= 'basic';

    // New - configuration bundles
    // let applyDefaults = true;
    // if (fixedSettings.WysiwygConfiguration) {
    //   const wysiwygConfig = config.settings.Entities.find(e => e.Guid === fixedSettings.WysiwygConfiguration);
    //   if (wysiwygConfig) {
    //     applyDefaults = false;
    //     console.log('2dm wysiwyg config', wysiwygConfig);
    //   }
    // }
    console.log('2dm wysiwyg config', settings, fixedSettings, tools);
    return fixedSettings;
  }
}

FieldLogicBase.add(StringWysiwygLogic);

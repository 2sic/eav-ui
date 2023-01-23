import { FieldSettings, StringWysiwyg, StringWysiwygAdvanced } from '../../../../../../../../edit-types';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { FieldLogicBase } from '../../../shared/field-logic/field-logic-base';
import { FieldLogicTools } from '../../../shared/field-logic/field-logic-tools';

export class StringWysiwygLogic extends FieldLogicBase {
  name = InputTypeConstants.StringWysiwyg;

  canAutoTranslate = true;

  update(settings: StringWysiwyg, _: unknown, tools: FieldLogicTools): FieldSettings {
    const fixedSettings: StringWysiwyg = { ...settings };
    fixedSettings.Dialog ||= 'inline';
    fixedSettings.ButtonSource ||= '';
    fixedSettings.ButtonAdvanced ||= '';
    fixedSettings.ContentCss ||= '';
    fixedSettings.InlineInitialHeight ||= '3';
    fixedSettings.WysiwygMode ||= 'basic';

    // New - configuration bundles
    fixedSettings._advanced = buildAdvanced(fixedSettings.WysiwygConfiguration, tools);
    return fixedSettings as FieldSettings;
  }
}

FieldLogicBase.add(StringWysiwygLogic);

function buildAdvanced(possibleGuid: string, tools: FieldLogicTools) {
  const defaults: StringWysiwygAdvanced = {
    Mode: 'default',
    Json: '',
  };
  if (!possibleGuid) return defaults;

  const wysiwygConfig = tools.eavConfig.settings.Entities.find(e => e.Guid === possibleGuid);
  if (!wysiwygConfig) return defaults;

  const advanced = tools.entityReader.flatten(wysiwygConfig) as StringWysiwygAdvanced;
  return { ...defaults, ...advanced };
}

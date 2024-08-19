import { AdamItem, FieldSettings, FieldValue, StringWysiwyg } from '../../../../../../../../edit-types';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { FieldLogicBase, FieldLogicUpdate } from '../../../shared/field-logic/field-logic-base';
import { FieldLogicWithValueInit } from '../../../shared/field-logic/field-logic-with-init';

export class StringWysiwygLogic extends FieldLogicBase implements FieldLogicWithValueInit {
  name = InputTypeConstants.StringWysiwyg;

  canAutoTranslate = true;

  update({ settings, tools }: FieldLogicUpdate): FieldSettings {
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

    return fixedSettings as FieldSettings;
  }

  /** Checks if dataCmsId is same as file name and if it is switches img src with adam item url */
  processValueOnLoad(value: FieldValue, adamItems: AdamItem[]): FieldValue {
    try {
      const doc = new DOMParser().parseFromString(value as string, 'text/html');
      doc.body.querySelectorAll('img').forEach((img) => {
        const dataCmsid = img.getAttribute('data-cmsid')?.replace('file:', '');
        const src = img.getAttribute('src');
        if (dataCmsid && src) {
          const fileName = src.split('/').pop();
          if (dataCmsid === fileName) {
            const adamItem = adamItems.find(x => x.Name === dataCmsid);
            if (adamItem)
              img.setAttribute('src', adamItem.Url);
          }
        }
      });
      return doc.body.innerHTML;
    } catch (error) {
      console.error('Error while cleaning wysiwyg content', error);
      return value;
    }
  }
}

FieldLogicBase.add(StringWysiwygLogic);


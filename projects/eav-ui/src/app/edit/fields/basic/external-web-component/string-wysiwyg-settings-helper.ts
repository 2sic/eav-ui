import { AdamItem } from '../../../../../../../edit-types/src/AdamItem';
import { FieldSettings } from '../../../../../../../edit-types/src/FieldSettings';
import { StringWysiwyg, StringWysiwygGlobals } from '../../../../../../../edit-types/src/FieldSettings-String';
import { FieldValue } from '../../../../../../../edit-types/src/FieldValue';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { FieldSettingsHelperBase, fieldSettingsLogSpecs } from '../../logic/field-settings-helper-base';
import { FieldSettingsHelperWithValueInit } from '../../logic/field-settings-helper-with-value-init';
import { FieldSettingsUpdateTask } from '../../logic/field-settings-update-task';

const logSpecs = {
  ...fieldSettingsLogSpecs,
  all: false,
  constructor: true,
  update: true,
  // fields: [...DebugFields, 'Icon'],
}

export class StringWysiwygSettingsHelper extends FieldSettingsHelperBase implements FieldSettingsHelperWithValueInit {
  name = InputTypeCatalog.StringWysiwyg;

  constructor() { super({ StringWysiwygSettingsHelper }, false, logSpecs); }

  canAutoTranslate = true;

  update({ settings, tools }: FieldSettingsUpdateTask): FieldSettings {

    const defaults: Partial<StringWysiwygGlobals> = tools.eavConfig.settings?.Values["Settings.InputFields.StringWysiwyg"] || {};

    const l = this.log.fnIf('update', { global: defaults, settings });
    const fixedSettings = {
      ...defaults,
      ...settings,
      _defaults: defaults,
    } as FieldSettings & StringWysiwyg;
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

    l.a('updated settings', { settings, fixedSettings});
    return l.r(fixedSettings);
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

FieldSettingsHelperBase.add(StringWysiwygSettingsHelper);


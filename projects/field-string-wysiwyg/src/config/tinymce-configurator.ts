import type { Editor } from 'tinymce';
import { classLog } from '../../../../projects/eav-ui/src/app/shared/logging';
import { AddOnSettings } from '../../../edit-types/src/AddOnSettings';
import { Connector } from '../../../edit-types/src/Connector';
import { StringWysiwyg } from '../../../edit-types/src/FieldSettings';
import { WysiwygReconfigure } from '../../../edit-types/src/WysiwygReconfigure';
import * as DisplayModes from '../constants/display-modes';
import * as contentStyle from '../editor/tinymce-content.scss';
import { DefaultAddOnSettings, DefaultPaste } from './defaults';
import { RawEditorOptionsExtended } from './raw-editor-options-extended';
import { TranslationsLoader } from './translation-loader';
import { WysiwygConfigurationManager } from './wysiwyg-configuration-manager';

const logSpecs = {
  all: false,
  constructor: true,
  isWysiwygPasteFormatted$: false,
};

const reconfigErr = `Very likely an error in your reconfigure code. Check https://go.2sxc.org/field-wysiwyg`;

/** This object will configure the TinyMCE */
export class TinyMceConfigurator {
  
  log = classLog({ TinyMceConfigurator }, logSpecs);
  
  addOnSettings: AddOnSettings = { ...DefaultAddOnSettings };

  #language: string;
  #isWysiwygPasteFormatted = this.connector._experimental.isFeatureEnabled['WysiwygPasteFormatted'];

  constructor(private connector: Connector<string>, private reconfigure: WysiwygReconfigure) {
    this.log.fnIf('constructor', { connector, reconfigure, pastFormatted: this.#isWysiwygPasteFormatted() });

    this.#language = this.connector._experimental.translateService.currentLang;

    // call optional reconfiguration
    if (reconfigure) {
      reconfigure.initManager?.(window.tinymce);
      if (reconfigure.configureAddOns) {
        const changedAddOns = reconfigure.configureAddOns(this.addOnSettings);
        if (changedAddOns)
          this.addOnSettings = changedAddOns;
        else
          console.error(`reconfigure.configureAddOns(...) didn't return a value. ${reconfigErr}`);
      }

      this.addOnSettings = reconfigure.configureAddOns?.(this.addOnSettings) || this.addOnSettings;
    }

    this.#warnAboutCommonSettingsIssues();
  }

  #warnAboutCommonSettingsIssues(): void {
    const contentCss = (this.connector.field.settings as unknown as StringWysiwyg).ContentCss;
    if (contentCss && contentCss?.toLocaleLowerCase().includes('file:'))
      console.error(`Found a setting for wysiwyg ContentCss but it should be a real link, got this instead: '${contentCss}'`);
  }

  /** Construct TinyMCE options */
  buildOptions(selectorClass: string, fixedToolbarClass: string, modeIsInline: boolean, setup: (editor: Editor) => void): RawEditorOptionsExtended {
    const connector = this.connector;
    const exp = connector._experimental;
    // Create a TinyMceModeConfig object with bool only
    // Then pass this object into the build(...) below, replacing the original 3 parameters
    const fieldSettings = connector.field.settings as unknown as StringWysiwyg;

    // 2. Get the preset configuration for this mode
    const configManager = new WysiwygConfigurationManager(connector, fieldSettings);
    const wysiwygConfiguration = configManager.getSettings(null, modeIsInline ? DisplayModes.DisplayInline : DisplayModes.DisplayDialog);

    // 3. Dropzone / adam checks
    if (exp.dropzone == null || exp.adam == null)
      console.error(`Dropzone or ADAM Config not available, some things won't work`);

    // 2022-08-12 2dm
    // The setting can be an empty string, in which case tinyMCE assumes it's the file name of a stylesheet
    // and tries to load the current folder as a stylesheet
    // This is useless and causes problems in DNN, because it results in logging out the user
    // See https://github.com/2sic/2sxc/issues/2829
    let contentCssFile = fieldSettings.ContentCss;
    if (!contentCssFile)
      contentCssFile = null;

    const options: RawEditorOptionsExtended = {
      ...wysiwygConfiguration.tinyMce,
      selector: `.${selectorClass}`,
      fixed_toolbar_container: `.${fixedToolbarClass}`,
      content_style: contentStyle.default,
      content_css: contentCssFile,
      setup,
      configManager: configManager,
      ...TranslationsLoader.getLanguageOptions(this.#language),
      ...(this.#isWysiwygPasteFormatted() ? DefaultPaste.formattedText : {}),
      ...DefaultPaste.images(exp.dropzone, exp.adam),
      promotion: false,
      block_unsupported_drop: false,
    };

    // If this is inherited by a customized field, then call it's configureOptions (if available)
    if (this.reconfigure?.configureOptions) {
      const newOptions = this.reconfigure.configureOptions(options);
      if (newOptions)
        return newOptions;
      console.error(`reconfigure.configureOptions(options) didn't return an options object. ${reconfigErr}`);
    }
    return options;
  }

  addTranslations(): void {
    TranslationsLoader.addTranslations(this.#language, this.connector._experimental.translateService);
    this.reconfigure?.addTranslations?.(window.tinymce, this.#language);
  }
}

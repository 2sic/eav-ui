import type { Editor } from 'tinymce';
import { FeaturesConstants } from '../../../eav-ui/src/app/edit/shared/constants';
import { EavWindow } from '../../../eav-ui/src/app/shared/models/eav-window.model';
import { AddOnSettings, Connector, WysiwygReconfigure } from '../../../edit-types';
import * as contentStyle from '../editor/tinymce-content.scss';
import { DefaultAddOnSettings, DefaultOptions, DefaultPaste, DefaultPlugins } from './defaults';
import { RawEditorOptionsWithModes } from './tinymce-helper-types';
import { TinyMceToolbars } from './toolbars';
import { TinyMceTranslations } from './translations';

declare const window: EavWindow;
const reconfigErr = `Very likely an error in your reconfigure code. Check http://r.2sxc.org/field-wysiwyg`;

/** This object will configure the TinyMCE */
export class TinyMceConfigurator {
  addOnSettings: AddOnSettings = { ...DefaultAddOnSettings };

  private language: string;

  constructor(private connector: Connector<string>, private reconfigure: WysiwygReconfigure) {
    this.language = this.connector._experimental.translateService.currentLang;

    // call optional reconfiguration
    if (reconfigure) {
      reconfigure.initManager?.(window.tinymce);
      if (reconfigure.configureAddOns) {
        const changedAddOns = reconfigure.configureAddOns(this.addOnSettings);
        if (changedAddOns) {
          this.addOnSettings = changedAddOns;
        } else {
          console.error(`reconfigure.configureAddOns(...) didn't return a value. ${reconfigErr}`);
        }
      }

      this.addOnSettings = reconfigure.configureAddOns?.(this.addOnSettings) || this.addOnSettings;
      // if (reconfigure.optionsInit) reconfigure.optionsInit(this.options, this.instance);
    }

    this.warnAboutCommonSettingsIssues();
  }

  private warnAboutCommonSettingsIssues(): void {
    const contentCss = this.connector.field.settings.ContentCss;
    if (contentCss && contentCss?.toLocaleLowerCase().includes('file:')) {
      console.error(`Found a setting for wysiwyg ContentCss but it should be a real link, got this instead: '${contentCss}'`);
    }
  }

  /** Construct TinyMCE options */
  buildOptions(containerClass: string, fixedToolbarClass: string, inlineMode: boolean, setup: (editor: Editor) => void): RawEditorOptionsWithModes {
    const connector = this.connector;
    const exp = connector._experimental;
    // TODO: @SDV - I think you should already convert them to bool here
    // Create a TinyMceModeConfig object with bool only
    // Then pass this object into the build(...) below, replacing the original 3 parameters
    const buttonSource = connector.field.settings.ButtonSource;
    const buttonAdvanced = connector.field.settings.ButtonAdvanced;
    const contentDivisions = connector.field.settings.ContentDivisions; // for now, make the default (if not set) to be true
    const dropzone = exp.dropzone;
    const adam = exp.adam;

    // @SDV also put this in the new TinyMceModeConfig object on features.contentBlocks
    const contentBlocksEnabled = exp.allInputTypeNames[connector.field.index + 1]?.inputType === 'entity-content-blocks';
    const toolbarModes = TinyMceToolbars.build(contentBlocksEnabled, inlineMode, buttonSource, buttonAdvanced, contentDivisions);

    if (dropzone == null || adam == null) {
      console.error(`Dropzone or ADAM Config not available, some things won't work`);
    }

    // 2022-08-12 2dm
    // The setting can be an empty string, in which case tinyMCE assumes it's the file name of a stylesheet
    // and tries to load the current folder as a stylesheet
    // This is useless and causes problems in DNN, because it results in logging out the user
    // See https://github.com/2sic/2sxc/issues/2829
    let contentCssFile = connector.field.settings?.ContentCss;
    if (!contentCssFile) contentCssFile = null;

    const options: RawEditorOptionsWithModes = {
      ...DefaultOptions,
      ...{ plugins: [...DefaultPlugins] },
      selector: `.${containerClass}`,
      fixed_toolbar_container: `.${fixedToolbarClass}`,
      content_style: contentStyle.default,
      content_css: contentCssFile,
      setup,
      ...toolbarModes,
      ...TinyMceTranslations.getLanguageOptions(this.language),
      ...(exp.isFeatureEnabled(FeaturesConstants.WysiwygPasteFormatted) ? DefaultPaste.formattedText : {}),
      ...(exp.isFeatureEnabled(FeaturesConstants.PasteImageFromClipboard) ? DefaultPaste.images(dropzone, adam) : {}),
      promotion: false,
      block_unsupported_drop: false,
    };

    if (this.reconfigure?.configureOptions) {
      const newOptions = this.reconfigure.configureOptions(options);
      if (newOptions) return newOptions;
      console.error(`reconfigure.configureOptions(options) didn't return an options object. ${reconfigErr}`);
    }
    return options;
  }

  addTranslations(): void {
    TinyMceTranslations.addTranslations(this.language, this.connector._experimental.translateService);
    this.reconfigure?.addTranslations?.(window.tinymce, this.language);
  }
}

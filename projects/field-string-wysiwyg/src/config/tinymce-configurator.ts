import { Connector } from '../../../edit-types';
import { WysiwygReconfigure } from '../../../edit-types';
import { FeaturesConstants } from '../../../edit/shared/constants';
import * as contentStyle from '../editor/tinymce-content.css';
import { TinyType } from '../shared/models';
import { DefaultAddOnSettings, DefaultOptions, DefaultPaste, DefaultPlugins } from './defaults';
import { TinyMceToolbars } from './toolbars';
import { TinyMceTranslations } from './translations';

const reconfigErr = `Very likely an error in your reconfigure code. Check https://r.2sxc.org/field-wysiwyg`;

/** This object will configure the TinyMCE */
export class TinyMceConfigurator {
  /** Language used - will be set by the constructor */
  private language: string;

  /** Standard constructor */
  constructor(
    /** TinyMCE editorManager - in charge of buttons, i18n etc. */
    public editorManager: TinyType,
    private connector: Connector<string>,
    /** Reconfiguration object - which can optionally change/extend/enhance stuff */
    private reconfigure: WysiwygReconfigure,
  ) {
    this.language = connector._experimental.translateService.currentLang;

    // call optional reconfiguration
    if (reconfigure) {
      reconfigure.initManager?.(editorManager);
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

  /** Options to be used - can be modified before it's applied */
  private options = { ...DefaultOptions, ...{ plugins: [...DefaultPlugins] } };  // copy the object, so changes don't affect original

  public addOnSettings = { ...DefaultAddOnSettings };

  private warnAboutCommonSettingsIssues() {
    const contentCss = this.connector.field.settings.ContentCss;
    if (contentCss && contentCss?.toLocaleLowerCase().indexOf('file:') >= 0) {
      console.error(`Found a setting for wysiwyg ContentCss but it should be a real link, got this instead: '${contentCss}'`);
    }
  }

  /** Construct TinyMce options */
  buildOptions(containerClass: string, fixedToolbarClass: string, inlineMode: boolean, setup: (editor: TinyType) => void) {
    const connector = this.connector;
    const exp = connector._experimental;
    const buttonSource = connector.field.settings.ButtonSource;
    const buttonAdvanced = connector.field.settings.ButtonAdvanced;
    const dropzone = exp.dropzone;
    const adam = exp.adam;
    if (dropzone == null || adam == null) { console.error(`Dropzone or ADAM Config not available, some things won't work`); }
    // enable content blocks if there is another field after this one and it's type is entity-content-blocks
    const contentBlocksEnabled = (exp.allInputTypeNames.length > connector.field.index + 1)
      ? exp.allInputTypeNames[connector.field.index + 1].inputType === 'entity-content-blocks'
      : false;

    // build options based on defaults + a few instance specific properties
    let options = {
      ...this.options,
      // plugins: this.plugins,
      selector: `.${containerClass}`,
      fixed_toolbar_container: `.${fixedToolbarClass}`,
      content_style: contentStyle.default,
      content_css: connector.field.settings?.ContentCss,
      setup, // callback function during setup
    };

    const modesOptions = TinyMceToolbars.build(contentBlocksEnabled, inlineMode, buttonSource, buttonAdvanced);
    options = { ...options, ...modesOptions };

    // TODO: SPM - unsure if this actually does anything, as we already add all i18n?
    options = { ...options, ...TinyMceTranslations.getLanguageOptions(this.language) };

    if (exp.isFeatureEnabled(FeaturesConstants.PasteWithFormatting)) {
      options = { ...options, ...DefaultPaste.formattedText };
    }

    if (exp.isFeatureEnabled(FeaturesConstants.PasteImageFromClipboard)) {
      options = { ...options, ...DefaultPaste.images(dropzone, adam) };
    }

    if (this.reconfigure?.configureOptions) {
      const newOptions = this.reconfigure.configureOptions(options);
      if (newOptions) { return newOptions; }
      console.error(`reconfigure.configureOptions(options) didn't return an options object. ${reconfigErr}`);
    }
    return options;
  }

  addTranslations() {
    TinyMceTranslations.addTranslations(this.language, this.connector._experimental.translateService, this.editorManager);
    this.reconfigure?.addTranslations?.(this.editorManager, this.language);
  }
}

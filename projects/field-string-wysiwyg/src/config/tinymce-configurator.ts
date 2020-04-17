import { InitialConfig } from '../config/initial-config';
import { TinyMceTranslations } from './translations';
import { Connector } from '../../../edit-types';
import { DefaultPlugins, DefaultOptions, DefaultPaste } from './defaults';
import { FeaturesGuidsConstants as FeatGuids } from '../../../shared/features-guids.constants';
import * as contentStyle from '../main/tinymce-content.css';
import { TinyMceToolbars } from './toolbars';
import { WysiwygReconfigure } from '../../../edit-types/src/WysiwygReconfigure';
    // tslint:disable: curly

/**
 * This object will configure the tinyMCE
 */
export class TinyMceConfigurator {
  /** language used - will be set by the constructor */
  private language: string;

  /** Standard constructor */
  constructor(
    /** TinyMCE editorManager - in charge of buttons, i18n etc. */
    public editorManager: any,
    private connector: Connector<any>,
    /** Reconfiguration object - which can optionally change/extend/enhance stuff */
    private reconfigure: WysiwygReconfigure,
    ) {
    this.language = connector._experimental.translateService.currentLang;
    if (reconfigure) {
      reconfigure.initManager?.(editorManager);
      if (reconfigure.initOptions) this.options = reconfigure.initOptions(this.options);
      if (reconfigure.initPlugins) this.plugins = reconfigure.initPlugins(this.plugins);
    }
  }

  /** options to be used - can be modified before it's applied */
  options = {...DefaultOptions};  // copy the object, so changes don't affect original

  /** tinyMce plugins - can be modified before they are applied */
  plugins = {...DefaultPlugins};  // copy the object, so changes don't affect original


  /**
   * Create an initial configuration - which will later be used to construct the options
   */
  initialConfig(containerCls: string, fixedToolbarCls: string, setup: (editor: any) => any): InitialConfig {
    const connector = this.connector;
    const exp = connector._experimental;
    const contentBlocksEnabled = (exp.allInputTypeNames.length > connector.field.index + 1)
      ? exp.allInputTypeNames[connector.field.index + 1].inputType === 'entity-content-blocks'
      : false;
    // const pasteFormattedTextEnabled = exp.isFeatureEnabled(FeaturesGuidsConstants.PasteWithFormatting);
    // this.pasteImageFromClipboardEnabled = exp.isFeatureEnabled(FeatGuids.PasteImageFromClipboard);
    const dropzoneConfig = exp.dropzoneConfig$.value;
    const initialConfig: InitialConfig = {
      containerClass: containerCls,
      fixedToolbarClass: fixedToolbarCls,
      contentStyle: contentStyle.default,
      setup, // this.tinyMceSetup.bind(this),
      currentLang: exp.translateService.currentLang,
      contentBlocksEnabled,
      pasteFormattedTextEnabled: exp.isFeatureEnabled(FeatGuids.PasteWithFormatting),
      pasteImageFromClipboardEnabled: exp.isFeatureEnabled(FeatGuids.PasteImageFromClipboard),
      imagesUploadUrl: dropzoneConfig.url as string,
      uploadHeaders: dropzoneConfig.headers,
      inlineMode: exp.wysiwygSettings.inlineMode,
      buttonSource: exp.wysiwygSettings.buttonSource,
      buttonAdvanced: exp.wysiwygSettings.buttonAdvanced,
    };
    return initialConfig;
  }

  /**
   * Construct TinyMce options
   */
  tinyMceOptions(config: InitialConfig) {
    // build options based on defaults + a few instance specific properties
    let options = {...this.options,
      plugins: this.plugins,
      selector: `.${config.containerClass}`,
      fixed_toolbar_container: `.${config.fixedToolbarClass}`,
      content_style: config.contentStyle,
      setup: config.setup, // callback function during setup
    };

    const modesOptions = TinyMceToolbars.build(config.contentBlocksEnabled,
      config.inlineMode, config.buttonSource, config.buttonAdvanced);
    options = { ...options, ...modesOptions };

    // TODO: SPM - unsure if this actually does anything, as we already add all i18n?
    options = { ...options, ...TinyMceTranslations.getLanguageOptions(config.currentLang) };

    if (config.pasteFormattedTextEnabled) {
      options = { ...options, ...DefaultPaste.formattedText };
    }

    if (config.pasteImageFromClipboardEnabled) {
      options = { ...options, ...DefaultPaste.images(config.imagesUploadUrl, config.uploadHeaders) };
    }
console.log('tinymce options', options);
    return options;
  }




  addTranslations() {
    TinyMceTranslations.addTranslations(this.language,
      this.connector._experimental.translateService,
      this.editorManager);
  }
}

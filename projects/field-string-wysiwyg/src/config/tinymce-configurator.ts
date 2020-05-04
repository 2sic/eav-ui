import { TinyMceTranslations } from './translations';
import { Connector } from '../../../edit-types';
import { DefaultPlugins, DefaultOptions, DefaultPaste } from './defaults';
import { FeaturesGuidsConstants as FeatGuids } from '../../../shared/features-guids.constants';
import * as contentStyle from '../main/tinymce-content.css';
import { TinyMceToolbars } from './toolbars';
import { WysiwygReconfigure } from '../../../edit-types/src/WysiwygReconfigure';
import { TinyInstanceOptions } from './defaults/tinyInstance';
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

    // call optional reconfiguration
    if (reconfigure) {
      reconfigure.managerInit?.(editorManager);
      if (reconfigure.optionsInit) reconfigure.optionsInit(this.options, this.instance);
    }

  }

  /** options to be used - can be modified before it's applied */
  options = { ...DefaultOptions, ...{ plugins: [...DefaultPlugins] } };  // copy the object, so changes don't affect original

  instance = { ...TinyInstanceOptions };

  /**
   * Construct TinyMce options
   */
  buildOptions(containerClass: string, fixedToolbarClass: string, setup: (editor: any) => any) {
    const connector = this.connector;
    const exp = connector._experimental;
    const inlineMode = exp.inlineMode;
    const buttonSource = connector.field.settings.ButtonSource;
    const buttonAdvanced = connector.field.settings.ButtonAdvanced;
    const dropzoneConfig = exp.dropzoneConfig$.value;
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
      setup, // callback function during setup
    };

    const modesOptions = TinyMceToolbars.build(contentBlocksEnabled, inlineMode, buttonSource, buttonAdvanced);
    options = { ...options, ...modesOptions };

    // TODO: SPM - unsure if this actually does anything, as we already add all i18n?
    options = { ...options, ...TinyMceTranslations.getLanguageOptions(this.language) };

    if (exp.isFeatureEnabled(FeatGuids.PasteWithFormatting))
      options = { ...options, ...DefaultPaste.formattedText };

    if (exp.isFeatureEnabled(FeatGuids.PasteImageFromClipboard))
      options = { ...options, ...DefaultPaste.images(dropzoneConfig.url as string, dropzoneConfig.headers) };

    if (this.reconfigure?.optionsReady)
      this.reconfigure.optionsReady(options);
    return options;
  }




  addTranslations() {
    TinyMceTranslations.addTranslations(this.language,
      this.connector._experimental.translateService,
      this.editorManager);
    this.reconfigure?.addTranslations?.(this.editorManager, this.language);
  }
}

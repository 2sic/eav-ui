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

    // call optional reconfiguration
    if (reconfigure) {
      reconfigure.managerInit?.(editorManager);
      if (reconfigure.optionsInit) this.options = reconfigure.optionsInit(this.options);
      if (reconfigure.pluginsInit) this.plugins = reconfigure.pluginsInit(this.plugins);
    }

  }

  /** options to be used - can be modified before it's applied */
  options = {...DefaultOptions};  // copy the object, so changes don't affect original

  /** tinyMce plugins - can be modified before they are applied */
  plugins = [...DefaultPlugins];  // copy the array, so changes don't affect original

  /**
   * Construct TinyMce options
   */
  buildOptions(containerClass: string, fixedToolbarClass: string, setup: (editor: any) => any) {
    const connector = this.connector;
    const exp = connector._experimental;
    const wys = exp.wysiwygSettings;
    const dropzoneConfig = exp.dropzoneConfig$.value;
    // enable content blocks if there is another field after this one and it's type is entity-content-blocks
    const contentBlocksEnabled = (exp.allInputTypeNames.length > connector.field.index + 1)
      ? exp.allInputTypeNames[connector.field.index + 1].inputType === 'entity-content-blocks'
      : false;

    // build options based on defaults + a few instance specific properties
    let options = {
      ...this.options,
      plugins: this.plugins,
      selector: `.${containerClass}`,
      fixed_toolbar_container: `.${fixedToolbarClass}`,
      content_style: contentStyle.default,
      setup, // callback function during setup
    };

    const modesOptions = TinyMceToolbars.build(contentBlocksEnabled, wys.inlineMode, wys.buttonSource, wys.buttonAdvanced);
    options = { ...options, ...modesOptions };

    // TODO: SPM - unsure if this actually does anything, as we already add all i18n?
    options = { ...options, ...TinyMceTranslations.getLanguageOptions(this.language) };

    if (exp.isFeatureEnabled(FeatGuids.PasteWithFormatting))
      options = { ...options, ...DefaultPaste.formattedText };

    if (exp.isFeatureEnabled(FeatGuids.PasteImageFromClipboard))
      options = { ...options, ...DefaultPaste.images(dropzoneConfig.url as string, dropzoneConfig.headers) };

    if (this.reconfigure?.optionsReady)
      options = this.reconfigure.optionsReady(options);
    return options;
  }




  addTranslations() {
    TinyMceTranslations.addTranslations(this.language,
      this.connector._experimental.translateService,
      this.editorManager);
    this.reconfigure?.i18nReady?.(this.editorManager, this.language);
  }
}

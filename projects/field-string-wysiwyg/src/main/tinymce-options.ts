import { InitialConfig } from '../config/initial-config';
import { TinyMceTranslations } from '../config/translations';
import { DefaultPaste } from '../config/defaults/paste';
import { TinyMceToolbars } from '../config/toolbars';
import { DefaultOptions } from '../config/defaults/options';

export function getTinyOptions(config: InitialConfig) {

  let options = {...DefaultOptions,
    selector: `.${config.containerClass}`,
    fixed_toolbar_container: `.${config.fixedToolbarClass}`,
    content_style: config.contentStyle,
    setup: config.setup, // callback function during setup
  };

  const modesOptions = TinyMceToolbars.build(config.contentBlocksEnabled,
    config.inlineMode, config.buttonSource, config.buttonAdvanced);
  options = { ...options, ...modesOptions };

  const languageOptions = TinyMceTranslations.getLanguageOptions(config.currentLang);
  options = { ...options, ...languageOptions };

  if (config.pasteFormattedTextEnabled) {
    options = { ...options, ...DefaultPaste.formattedText };
  }

  if (config.pasteImageFromClipboardEnabled) {
    options = { ...options, ...DefaultPaste.images(config.imagesUploadUrl, config.uploadHeaders) };
  }

  return options;
}

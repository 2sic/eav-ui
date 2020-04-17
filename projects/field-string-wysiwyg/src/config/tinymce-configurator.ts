import { InitialConfig } from '../config/initial-config';
import { TinyMceTranslations } from './translations';
import { Connector } from '../../../edit-types';
import { DefaultPlugins, DefaultOptions } from './defaults';

/**
 * This object will configure the tinyMCE
 */
export class TinyMceConfigurator {
  private language: string;
  constructor(private tinyMce: any, private connector: Connector<any>) {
    this.language = connector._experimental.translateService.currentLang;
  }

  options = DefaultOptions;
  plugins = DefaultPlugins;

  initialConfig(original: InitialConfig): InitialConfig {
    return original;
  }

  addTranslations() {
    TinyMceTranslations.addTranslations(this.language,
      this.connector._experimental.translateService,
      this.tinyMce);
  }
}

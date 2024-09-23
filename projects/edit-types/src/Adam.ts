import { AdamItem } from './AdamItem';
import { AdamConfig } from './AdamConfig';
import { Signal } from '@angular/core';

export interface Adam {
  /**
   * Signal of ADAM items shown in the current control
   */
  items: Signal<AdamItem[]>;

  /**
   * Changes ADAM configuration, but if values match previous, then shows/hides ADAM browser
   */
  toggle(usePortalRoot: boolean, showImagesOnly: boolean): void;

  /**
   * Takes full or partial ADAM configuration and calculates new values. Run at least once for initial setup
   */
  setConfig(config: Partial<AdamConfig>): void;

  /**
   * Returns a snapshot of ADAM configuration
   */
  getConfig(): AdamConfig;

  /** Signal if the ADAM features are disabled */
  isDisabled: Signal<boolean>;

  /**
   * Runs when user clicks on an item in ADAM browser.
   * By default does nothing, but WYSIWYG can set it to insert the file into the editor.
   */
  onItemClick(item: AdamItem): void;

  /**
   * Runs when item is uploaded.
   * By default does nothing, but WYSIWYG can set it to insert the file into the editor.
   */
  onItemUpload(item: AdamItem): void;

  /**
   * Forces items refresh
   */
  refresh(): void;
}

import { computed, signal } from '@angular/core';
import { computedObj } from 'projects/eav-ui/src/app/shared/signals/signal.utilities';
import { Adam } from '../../../../../../../../edit-types/src/Adam';
import { AdamConfig } from '../../../../../../../../edit-types/src/AdamConfig';
import { AdamItem } from '../../../../../../../../edit-types/src/AdamItem';
import { classLog } from '../../../../../shared/logging';
import { AdamBrowserComponent } from './adam-browser.component';

const logSpecs = {
  all: false,
  setConfig: true,
}

/**
 * Helper to connect ADAM.
 * It will be added to the field state early on, but won't work until the browser is initialized.
 */
export class AdamConnector implements Adam {
  
  log = classLog({AdamConnector}, logSpecs, true);

  get browser() {
    const b = this.#browser();
    if (b) return b;
    throw new Error('Browser not set');
  }

  public setBrowser(browser: AdamBrowserComponent) {
    this.#browser.set(browser);
  }
  #browser = signal<AdamBrowserComponent>(null);

  #items = computedObj('items', () => this.#browser()?.items() ?? [] satisfies AdamItem[]);
  get items() { return this.#items };

  toggle(usePortalRoot: boolean, showImagesOnly: boolean) {
    this.log.fn('toggle', { usePortalRoot, showImagesOnly });
    this.browser.toggle(usePortalRoot, showImagesOnly)
  };

  #count = 0;

  setConfig(config: Partial<AdamConfig>) {
    const l = this.log.fnIf('setConfig', { config, count: this.#count });
    this.#count++;

    if (this.#count > 10)
      throw new Error('Infinite loop');

    this.browser.setConfig(config);
    l.end();
  };
  getConfig() { return this.browser.adamConfig() };

  isDisabled = computed(() => this.#browser()?.adamConfig()?.disabled ?? true);

  onItemClick() { return; }

  onItemUpload() { return; }

  refresh() {
    this.log.fn('refresh');
    this.browser.fetchItems()
  }

}
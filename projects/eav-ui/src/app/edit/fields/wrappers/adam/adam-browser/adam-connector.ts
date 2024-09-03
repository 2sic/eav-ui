import { Adam, AdamConfig, AdamItem } from '../../../../../../../../edit-types';
import { AdamBrowserComponent } from './adam-browser.component';
import { computed, signal } from '@angular/core';
import { EavLogger } from '../../../../../../../../eav-ui/src/app/shared/logging/eav-logger';

const logThis = false;
const nameOfThis = 'AdamConnector';

/**
 * Helper to connect ADAM.
 * It will be added to the field state early on, but won't work until the browser is initialized.
 */
export class AdamConnector implements Adam {

  get browser() {
    const b = this.#browser();
    if (b) return b;
    throw new Error('Browser not set');
  }

  public setBrowser(browser: AdamBrowserComponent) {
    this.#browser.set(browser);
  }
  #browser = signal<AdamBrowserComponent>(null);

  private log = new EavLogger(nameOfThis, logThis);

  get items() { return computed(() => this.#browser()?.items() ?? [] satisfies AdamItem[]) };

  toggle(usePortalRoot: boolean, showImagesOnly: boolean) {
    this.log.fn('toggle', { usePortalRoot, showImagesOnly });
    this.browser.toggle(usePortalRoot, showImagesOnly)
  };

  setConfig(config: Partial<AdamConfig>) {
    this.count++;

    if (this.count > 10)
      throw new Error('Infinite loop');
    this.log.fn('setConfig', { config });
    this.browser.setConfig(config)
  };
  count = 0;

  getConfig() { return this.browser.adamConfig() };

  isDisabled = computed(() => this.#browser()?.adamConfig()?.disabled ?? true);

  onItemClick() { return; }

  onItemUpload() { return; }

  refresh() {
    this.log.fn('refresh');
    this.browser.fetchItems()
  }

}
import { Observable } from 'rxjs';
import { AdamItem } from './AdamItem';
import { AdamConfig } from './AdamConfig';

export interface Adam {
  /**
   * Stream of filtered ADAM items
   */
  items$: Observable<AdamItem[]>;
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
  /**
   * Returns a stream (an observable) of ADAM configuration
   */
  getConfig$(): Observable<AdamConfig>;
  /**
   * Runs when user clicks on an item in ADAM browser
   */
  onItemClick(item: AdamItem): void;
  /**
   * Runs when item is uploaded
   */
  onItemUpload(item: AdamItem): void;
  /**
   * Forces items refresh
   */
  refresh(): void;
}

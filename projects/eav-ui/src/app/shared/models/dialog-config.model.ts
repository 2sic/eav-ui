import { Injector, Type } from '@angular/core';

/**
 * Custom configuration for a lazy-loaded dialog.
 */
export interface DialogConfig {
  name: string;
  /** Module root dialog has to init context */
  initContext: boolean;
  panelSize: 'small' | 'medium' | 'large' | 'fullscreen' | 'custom'; // has to match css
  panelClass: string[];

  showScrollbar?: boolean;

  /**
   * Get the component to be loaded in the dialog.
   */
  getComponent(injector?: Injector): Promise<Type<any>>;
}

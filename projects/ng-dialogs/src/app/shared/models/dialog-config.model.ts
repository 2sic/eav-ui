import { Type } from '@angular/core';

export interface DialogConfig {
  name: string;
  /** Module root dialog has to init context */
  initContext: boolean;
  panelSize: 'small' | 'medium' | 'large' | 'fullscreen' | 'custom'; // has to match css
  panelClass: string[];

  showScrollbar?: boolean;

  getComponent(): Promise<Type<any>>;
}

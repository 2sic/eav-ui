import { Type } from '@angular/core';

export interface DialogConfig {
  initContext: boolean;
  panelSize: 'small' | 'medium' | 'large' | 'fullscreen' | 'custom'; // has to match css
  panelClass: string[];
  getComponent(): Promise<Type<any>>;
}

import { DialogConfig } from '../../../../shared/models/dialog-config.model';

export const contentItemsDialogConfig: DialogConfig = {
  initContext: false,
  panelSize: 'large',
  panelClass: null,

  async getComponent() {
    const { ContentItemsComponent } = await import('./content-items.component');
    return ContentItemsComponent;
  }
};

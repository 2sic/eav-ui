import { DialogConfig } from '../shared/models/dialog-config.model';

export const contentItemsDialog: DialogConfig = {
  name: 'CONTENT_ITEMS_DIALOG',
  initContext: false,
  panelSize: 'large',
  panelClass: null,

  async getComponent() {
    const { ContentItemsComponent } = await import('./content-items.component');
    return ContentItemsComponent;
  }
};

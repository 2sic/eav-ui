import { DialogConfig } from '../shared/models/dialog-config.model';

export const itemHistoryDialog: DialogConfig = {
  name: 'ITEM_HISTORY_DIALOG',
  initContext: true,
  panelSize: 'medium',
  panelClass: null,

  async getComponent() {
    const { ItemHistoryComponent } = await import('./item-history.component');
    return ItemHistoryComponent;
  }
};

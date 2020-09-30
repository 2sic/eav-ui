import { DialogConfig } from '../../shared/models/dialog-config.model';

export const contentItemSnippetsDialog: DialogConfig = {
  name: 'CONTENT_ITEM_SNIPPETS_DIALOG',
  initContext: false,
  panelSize: 'small',
  panelClass: null,

  async getComponent() {
    const { ContentItemSnippetsComponent } = await import('./content-item-snippets.component');
    return ContentItemSnippetsComponent;
  }
};

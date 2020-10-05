import { DialogConfig } from '../../../shared/models/dialog-config.model';

export const contentTypeSnippetsDialog: DialogConfig = {
  name: 'CONTENT_TYPE_SNIPPETS_DIALOG',
  initContext: false,
  panelSize: 'fullscreen',
  panelClass: null,

  async getComponent() {
    const { ContentTypeSnippetsComponent } = await import('./content-type-snippets.component');
    return ContentTypeSnippetsComponent;
  }
};

import { DialogConfig } from '../shared/models/dialog-config.model';

export const replaceContentDialog: DialogConfig = {
  name: 'REPLACE_CONTENT_DIALOG',
  initContext: true,
  panelSize: 'medium',
  panelClass: null,

  async getComponent() {
    const { ReplaceContentComponent } = await import('./replace-content.component');
    return ReplaceContentComponent;
  }
};

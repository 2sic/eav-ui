import { DialogConfig } from '../shared/models/dialog-config.model';

export const metadataDialog: DialogConfig = {
  name: 'METADATA_DIALOG',
  initContext: true,
  panelSize: 'large',
  panelClass: null,

  async getComponent() {
    const { MetadataComponent } = await import('./metadata.component');
    return MetadataComponent;
  }
};

import { DialogConfig } from '../../../shared/models/dialog-config.model';

export const protoTypeAppDialog: DialogConfig = {
  name: 'PROTOTYPE_APP_DIALOG',
  initContext: false,
  panelSize: 'small',
  panelClass: null,

  async getComponent() {
    const { ProtoTypeFormComponent } = await import('./proto-type-form.component');
    return ProtoTypeFormComponent;
  }
};

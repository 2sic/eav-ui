import { DialogConfig } from '../../../shared/models/dialog-config.model';

export const registrationDialog: DialogConfig = {
  name: 'REGISTRATION_DIALOG',
  initContext: false,
  panelSize: 'small',
  panelClass: null,

  async getComponent() {
    const { RegistrationComponent } = await import('./registration.component');
    return RegistrationComponent;
  }
};
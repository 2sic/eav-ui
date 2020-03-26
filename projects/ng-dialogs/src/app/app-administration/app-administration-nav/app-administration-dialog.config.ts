import { DialogConfig } from '../../shared/models/dialog-config.model';

export const appAdministrationDialogConfig: DialogConfig = {
  // this is module root dialog and has to init context
  initContext: true,
  panelSize: 'large',
  panelClass: null,

  async getComponent() {
    const { AppAdministrationNavComponent } = await import('./app-administration-nav.component');
    return AppAdministrationNavComponent;
  }
};

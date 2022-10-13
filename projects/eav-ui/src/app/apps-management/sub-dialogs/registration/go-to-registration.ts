import { Route } from '@angular/router';
import { DialogEntryComponent } from '../../../shared/components/dialog-entry/dialog-entry.component';
import { registrationDialog } from './registration-dialog.config';

export class GoToRegistration {

  static getRoute(): Route {
    return {
      path: 'registration', component: DialogEntryComponent, data: { dialog: registrationDialog, title: 'Registration' }
    };
  }

  static getUrl(): string {
    return 'registration';
  }
}

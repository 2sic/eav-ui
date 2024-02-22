import { Route } from '@angular/router';
import { DialogEntryComponent } from '../../../shared/components/dialog-entry/dialog-entry.component';
import { registrationDialog } from './registration-dialog.config';


 // @2dg is no longer needed as Register is a separate SideNav and no longer a dialog
export class GoToRegistration {

  // static getRoute(): Route {
  //   return {
  //     path: 'registration', component: DialogEntryComponent, data: { dialog: registrationDialog, title: 'Registration' }
  //   };
  // }

  // static getUrl(): string {
  //   return 'registration';
  // }
}

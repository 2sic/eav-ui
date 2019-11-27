import { Observable } from 'rxjs';

import { Context } from '../../shared/context/context';

export class AppAdministrationDialogDataModel {
  context: Context;
  tabPath$: Observable<string>;
}

import { Observable } from 'rxjs';

import { Context } from '../../shared/context/context';

export class AppsManagementDialogDataModel {
  context: Context;
  tabPath$: Observable<string>;
}

import { Observable } from 'rxjs';

import { Context } from '../../shared/context/context';

export class AppsManagementDialogData {
  constructor(
    public context: Context,
    public tabPath$: Observable<string>,
  ) { }
}

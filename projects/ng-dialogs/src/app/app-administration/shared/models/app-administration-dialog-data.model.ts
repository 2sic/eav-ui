import { Observable } from 'rxjs';

import { Context } from '../../../shared/context/context';

export class AppAdministrationDialogData {
  constructor(
    public context: Context,
    public tabPath$: Observable<string>,
  ) { }
}

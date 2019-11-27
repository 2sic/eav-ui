import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { Context } from '../../shared/context/context';

@Injectable()
/** Dialog has separate params service because services in mat dialog are in separate scope */
export class AppsManagementDialogParamsService {
  context: Context;
  openedAppId$$ = new BehaviorSubject<number>(undefined);

  constructor() { }
}

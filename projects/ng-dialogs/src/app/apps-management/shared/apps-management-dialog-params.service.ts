import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
/** Dialog has separate params service because services in mat dialog are in separate scope */
export class AppsManagementDialogParamsService {
  zoneId: string;
  openedAppId = new BehaviorSubject<number>(undefined);

  constructor() { }
}

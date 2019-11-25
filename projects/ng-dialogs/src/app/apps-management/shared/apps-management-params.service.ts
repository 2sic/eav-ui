import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class AppsManagementParamsService {
  selectedTabPath = new BehaviorSubject<string>(undefined);
  openedAppId = new BehaviorSubject<number>(undefined);

  constructor() { }
}

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class AppAdministrationParamsService {
  selectedTabPath = new BehaviorSubject<string>(undefined);

  constructor() { }
}

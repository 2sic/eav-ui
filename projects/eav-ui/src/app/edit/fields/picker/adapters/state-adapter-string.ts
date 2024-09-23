import { logSpecsStateAdapter, StateAdapter } from "./state-adapter";
import { Injectable } from '@angular/core';
import { classLog } from "../../../../shared/logging";
import { StateUiMapperStringArray } from './state-ui-mapper-string-array';

@Injectable()
export class StateAdapterString extends StateAdapter {
 
  log = classLog({StateAdapterString}, logSpecsStateAdapter);

  constructor() { super(); }

  // Noop mapper, since the stored data must be string, and the UI data is also a string...?
  mapper = new StateUiMapperStringArray('todo field name', this.settings);

}

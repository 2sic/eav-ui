import { Injectable } from '@angular/core';
import { classLog } from "../../../../shared/logging";
import { logSpecsStateAdapter, StateAdapter } from "./state-adapter";
import { StateUiMapperStringArray } from './state-ui-mapper-string-array';

@Injectable()
export class StateAdapterString extends StateAdapter {

  log = classLog({ StateAdapterString }, logSpecsStateAdapter);

  constructor() { super(); }

  // Map the state (string to string array) and UI (string to string array)
  mapper = new StateUiMapperStringArray('todo field name', this.settings);

}

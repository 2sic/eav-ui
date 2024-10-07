import { Injectable } from '@angular/core';
import { classLog } from "../../../../shared/logging";
import { logSpecsStateAdapter, StateAdapter } from "./state-adapter";
import { StateUiMapperNumberArray } from './state-ui-mapper-number-array';

@Injectable()
export class StateAdapterNumber extends StateAdapter {

  log = classLog({ StateAdapterNumber }, logSpecsStateAdapter);

  constructor() { super(); }
  // Map the state (string to number array) and UI (number to string array)
  mapper = new StateUiMapperNumberArray('todo field name', this.settings);

}

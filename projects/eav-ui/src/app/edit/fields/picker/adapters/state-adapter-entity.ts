import { Injectable } from '@angular/core';
import { classLog } from "../../../../shared/logging";
import { logSpecsStateAdapter, StateAdapter } from "./state-adapter";
import { StateUiMapperNoop } from './state-ui-mapper-noop';

@Injectable()
export class StateAdapterEntity extends StateAdapter {
  
  log = classLog({StateAdapterEntity}, logSpecsStateAdapter);

  constructor() { super(); }

  mapper = new StateUiMapperNoop();
  
}

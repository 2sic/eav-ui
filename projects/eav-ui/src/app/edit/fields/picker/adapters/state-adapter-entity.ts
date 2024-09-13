import { StateAdapter } from "./state-adapter";
import { Injectable } from '@angular/core';
import { classLog } from "../../../../shared/logging";
import { StateUiMapperNoop } from './state-ui-mapper-noop';

@Injectable()
export class StateAdapterEntity extends StateAdapter {
  
  log = classLog({StateAdapterEntity});

  constructor() { super(); }

  mapper = new StateUiMapperNoop();
  
}

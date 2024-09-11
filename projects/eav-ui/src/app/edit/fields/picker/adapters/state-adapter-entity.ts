import { classLog } from "../../../../shared/logging";
import { StateAdapter } from "./state-adapter";
import { Injectable } from '@angular/core';

@Injectable()
export class StateAdapterEntity extends StateAdapter {

  log = classLog({StateAdapterEntity});

  constructor() { super(); }

  protected createNewValue(valueArray: string[]): string | string[] {
    this.log.a('createNewValue', { valueArray });
    return valueArray;
  }
}

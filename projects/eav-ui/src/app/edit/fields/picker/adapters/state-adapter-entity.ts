import { StateAdapter } from "./state-adapter";
import { Injectable } from '@angular/core';
import { classLog } from "../../../../shared/logging";

@Injectable()
export class StateAdapterEntity extends StateAdapter {
  
  constructor() {
    super(classLog({StateAdapterEntity}));
  }

  protected asFieldValue(valueArray: string[]): string | string[] {
    this.log.a('createNewValue', { valueArray });
    return valueArray;
  }
}

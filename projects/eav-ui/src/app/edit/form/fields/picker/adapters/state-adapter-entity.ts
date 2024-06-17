import { StateAdapter } from "./state-adapter";
import { Injectable } from '@angular/core';
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';

const logThis = false;
const nameOfThis = 'StateAdapterEntity';

@Injectable()
export class StateAdapterEntity extends StateAdapter {
  constructor() {
    super(new EavLogger(nameOfThis, logThis));
  }

  protected createNewValue(valueArray: string[]): string | string[] {
    this.log.a('createNewValue', valueArray);
    return valueArray;
  }
}
import { StateAdapter } from "./state-adapter";
import { convertArrayToString } from "../picker.helpers";
import { Injectable } from '@angular/core';
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';

const logThis = false;
const nameOfThis = 'StateAdapterString';

@Injectable()
export class StateAdapterString extends StateAdapter {
  constructor() {
    super(new EavLogger(nameOfThis, logThis));
  }

  protected createNewValue(valueArray: string[]): string | string[] {
    return convertArrayToString(valueArray, this.settings$.value.Separator);
  }
}
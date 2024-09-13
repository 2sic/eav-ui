import { StateAdapter } from "./state-adapter";
import { convertArrayToString } from "../picker.helpers";
import { Injectable } from '@angular/core';
import { classLog } from "../../../../shared/logging";

@Injectable()
export class StateAdapterString extends StateAdapter {
 
  constructor() {
    super(classLog({StateAdapterString}));
  }

  protected override asFieldValue(valueArray: string[]): string | string[] {
    return convertArrayToString(valueArray, this.settings().Separator);
  }
}

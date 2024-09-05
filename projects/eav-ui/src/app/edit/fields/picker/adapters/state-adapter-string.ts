import { StateAdapter } from "./state-adapter";
import { convertArrayToString } from "../picker.helpers";
import { Injectable } from '@angular/core';
import { EavLogger } from '../../../../shared/logging/eav-logger';

const logSpecs = {
  enabled: false,
  name: 'StateAdapterString',
};

@Injectable()
export class StateAdapterString extends StateAdapter {
  constructor() {
    super(new EavLogger(logSpecs));
  }

  protected override createNewValue(valueArray: string[]): string | string[] {
    return convertArrayToString(valueArray, this.settings().Separator);
  }
}

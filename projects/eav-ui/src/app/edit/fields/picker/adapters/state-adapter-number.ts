import { Injectable } from '@angular/core';
import { classLog } from "../../../../shared/logging";
import { signalObj } from '../../../../shared/signals/signal.utilities';
import { PickerFeatures } from '../picker-features.model';
import { logSpecsStateAdapter, StateAdapter } from "./state-adapter";
import { StateUiMapperNumberArray } from './state-ui-mapper-number-array';

@Injectable()
export class StateAdapterNumber extends StateAdapter {

  log = classLog({ StateAdapterNumber }, logSpecsStateAdapter);

  constructor() { super(); }

  public override myFeatures = signalObj('features', { multiValue: false } satisfies Partial<PickerFeatures>);

  // Map the state (string to number array) and UI (number to string array)
  mapper = new StateUiMapperNumberArray('todo field name', this.settings);

}

import { Injectable } from '@angular/core';
import { signalObj } from 'projects/eav-ui/src/app/shared/signals/signal.utilities';
import { classLog } from "../../../../shared/logging";
import { PickerFeatures } from '../picker-features.model';
import { logSpecsStateAdapter, StateAdapter } from "./state-adapter";
import { StateUiMapperNumberArray } from './state-ui-mapper-number-array';

@Injectable()
export class StateAdapterNumber extends StateAdapter {

  log = classLog({ StateAdapterNumber }, logSpecsStateAdapter);

  constructor() { super(); }

  public override features = signalObj('features', { multiValue: false } satisfies Partial<PickerFeatures>);

  // Map the state (string to number array) and UI (number to string array)
  mapper = new StateUiMapperNumberArray('todo field name', this.settings);

}

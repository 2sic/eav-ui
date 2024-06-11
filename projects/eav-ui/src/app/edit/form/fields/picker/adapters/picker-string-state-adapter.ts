import { StateAdapter } from "./picker-state-adapter";
import { convertArrayToString } from "../picker.helpers";
import { FormConfigService } from "../../../../shared/services";
import { Injectable } from '@angular/core';
import { PickerDataCacheService } from '../cache/picker-data-cache.service';
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';

const logThis = true;

@Injectable()
export class StateAdapterString extends StateAdapter {
  constructor(
    eavService: FormConfigService,
    entityCacheService: PickerDataCacheService,
  ) {
    super(
      eavService,
      entityCacheService,
      new EavLogger('PickerStringStateAdapter', logThis),
    );
  }

  protected createNewValue(valueArray: string[]): string | string[] {
    return convertArrayToString(valueArray, this.settings$.value.Separator);
  }
}
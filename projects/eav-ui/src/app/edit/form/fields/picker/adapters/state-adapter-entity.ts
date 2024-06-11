import { StateAdapter } from "./state-adapter";
import { FormConfigService } from "../../../../shared/services";
import { Injectable } from '@angular/core';
import { PickerDataCacheService } from '../cache/picker-data-cache.service';
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';

const logThis = false;

@Injectable()
export class StateAdapterEntity extends StateAdapter {
  constructor(
    eavService: FormConfigService,
    entityCacheService: PickerDataCacheService,
  ) {
    super(
      eavService,
      entityCacheService,
      new EavLogger('PickerEntityStateAdapter', logThis),
    );
  }

  protected createNewValue(valueArray: string[]): string | string[] {
    this.log.a('createNewValue', valueArray);
    return valueArray;
  }
}
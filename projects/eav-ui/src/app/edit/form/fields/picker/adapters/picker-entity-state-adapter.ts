import { PickerStateAdapter } from "./picker-state-adapter";
import { EavService } from "../../../../shared/services";
import { Injectable } from '@angular/core';
import { PickerDataCacheService } from '../cache/picker-data-cache.service';
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';

const logThis = false;

@Injectable()
export class PickerEntityStateAdapter extends PickerStateAdapter {
  constructor(
    eavService: EavService,
    entityCacheService: PickerDataCacheService,
    // stringQueryCacheService: StringQueryCacheService,
  ) {
    super(
      eavService,
      entityCacheService,
      // stringQueryCacheService,
      new EavLogger('PickerEntityStateAdapter', logThis),
    );
  }

  protected createNewValue(valueArray: string[]): string | string[] {
    this.log.add('createNewValue', valueArray);
    return valueArray;
  }
}
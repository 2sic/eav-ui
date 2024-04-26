import { PickerStateAdapter } from "./picker-state-adapter";
import { EavService } from "../../../../shared/services";
import { Injectable } from '@angular/core';
import { StringQueryCacheService } from '../../../../shared/store/ngrx-data/string-query-cache.service';
import { PickerDataCacheService } from '../../../../shared/store/ngrx-data/entity-cache.service';
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';

const logThis = true;

@Injectable()
export class PickerEntityStateAdapter extends PickerStateAdapter {
  constructor(
    eavService: EavService,
    entityCacheService: PickerDataCacheService,
    stringQueryCacheService: StringQueryCacheService,
  ) {
    super(
      eavService,
      entityCacheService,
      stringQueryCacheService,
      new EavLogger('PickerEntityStateAdapter', logThis),
    );
  }

  protected createNewValue(valueArray: string[]): string | string[] {
    this.log.add('createNewValue', valueArray);
    return valueArray;
  }
}
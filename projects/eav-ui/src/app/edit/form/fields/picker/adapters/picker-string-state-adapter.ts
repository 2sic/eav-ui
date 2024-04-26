import { PickerStateAdapter } from "./picker-state-adapter";
import { convertArrayToString } from "../picker.helpers";
import { EavService } from "../../../../shared/services";
import { Injectable } from '@angular/core';
import { PickerDataCacheService } from '../../../../shared/store/ngrx-data/entity-cache.service';
import { StringQueryCacheService } from '../../../../shared/store/ngrx-data/string-query-cache.service';
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';

const logThis = false;

@Injectable()
export class PickerStringStateAdapter extends PickerStateAdapter {
  constructor(
    eavService: EavService,
    entityCacheService: PickerDataCacheService,
    stringQueryCacheService: StringQueryCacheService,
  ) {
    super(
      eavService,
      entityCacheService,
      stringQueryCacheService,
      new EavLogger('PickerStringStateAdapter', logThis),
    );
  }

  protected createNewValue(valueArray: string[]): string | string[] {
    return convertArrayToString(valueArray, this.settings$.value.Separator);
  }
}
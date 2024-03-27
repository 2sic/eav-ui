import { AbstractControl } from "@angular/forms";
import { TranslateService } from "@ngx-translate/core";
import { FieldSettings, PickerItem } from "projects/edit-types";
import { BehaviorSubject, Observable } from "rxjs";
import { ControlStatus } from "../../../../shared/models";
import { QueryEntity } from "../../entity/entity-query/entity-query.models";
import { PickerStateAdapter } from "./picker-state-adapter";
import { convertArrayToString } from "../picker.helpers";
import { EavService } from "../../../../shared/services";
import { Injectable } from '@angular/core';
import { EntityCacheService } from '../../../../shared/store/ngrx-data/entity-cache.service';
import { StringQueryCacheService } from '../../../../shared/store/ngrx-data/string-query-cache.service';
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';

const logThis = true;

@Injectable()
export class PickerStringStateAdapter extends PickerStateAdapter {
  constructor(
    // public settings$: BehaviorSubject<FieldSettings> = new BehaviorSubject(null),
    // public controlStatus$: BehaviorSubject<ControlStatus<string | string[]>>,
    // public isExpanded$: Observable<boolean>,
    // public label$: Observable<string>,
    // public placeholder$: Observable<string>,
    // public required$: Observable<boolean>,
    // public cacheItems$: Observable<PickerItem[]>,
    // public stringQueryCache$: Observable<QueryEntity[]>,
    // public translate: TranslateService,
    // public control: AbstractControl,
    eavService: EavService,
    // focusOnSearchComponent: () => void,
    entityCacheService: EntityCacheService,
    stringQueryCacheService: StringQueryCacheService,
  ) {
    super(
      // settings$,
      // controlStatus$,
      // isExpanded$,
      // label$,
      // placeholder$,
      // required$,
      // cacheItems$,
      // stringQueryCache$,
      // // translate,
      // control,
      eavService,
      // focusOnSearchComponent,
      entityCacheService,
      stringQueryCacheService,
      new EavLogger('PickerStringStateAdapter', logThis),

    );
  }

  init(): void {
    super.init();
  }

  destroy(): void {
    super.destroy();
  }

  protected createNewValue(valueArray: string[]): string | string[] {
    return convertArrayToString(valueArray, this.settings$.value.Separator);
  }
}
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ControlStatus } from '../../../shared/models';
import { EditRoutingService } from '../../../shared/services';
import { EntityCacheService, StringQueryCacheService } from '../../../shared/store/ngrx-data';
import { PickerStateAdapter } from './picker-state-adapter';
import { PickerAdapterBase } from './picker-adapter-base';
import { ReorderIndexes } from './picker-list/picker-list.models';

@Injectable()
export class PickerStateAdapterFactoryService {
  constructor(
    private entityCacheService: EntityCacheService,
    private stringQueryCacheService: StringQueryCacheService,
    private translateService: TranslateService,
  ) { }

  fillPickerStateAdapter(
    pickerAdapterBase: PickerAdapterBase,
    editRoutingService: EditRoutingService,
    controlStatus$: BehaviorSubject<ControlStatus<string | string[]>>,
    label$: Observable<string>,
    placeholder$: Observable<string>,
    required$: Observable<boolean>,
  ): PickerStateAdapter {
    const pickerStateAdapter = new PickerStateAdapter();
    pickerStateAdapter.updateValue =
      (action: 'add' | 'delete' | 'reorder', value: string | number | ReorderIndexes) => pickerAdapterBase.updateValue(action, value);
    pickerStateAdapter.settings$ = pickerAdapterBase.settings$;
    pickerStateAdapter.config = pickerAdapterBase.config;
    pickerStateAdapter.disableAddNew$ = pickerAdapterBase.disableAddNew$;
    pickerStateAdapter.translate = this.translateService;
    pickerStateAdapter.cacheEntities$ = this.entityCacheService.getEntities$();
    pickerStateAdapter.stringQueryCache$ = this.stringQueryCacheService.getEntities$(pickerAdapterBase.config.entityGuid, pickerAdapterBase.config.fieldName);
    pickerStateAdapter.isExpanded$ = editRoutingService.isExpanded$(pickerAdapterBase.config.index, pickerAdapterBase.config.entityGuid);
    pickerStateAdapter.controlStatus$ = controlStatus$;
    pickerStateAdapter.label$ = label$;
    pickerStateAdapter.placeholder$ = placeholder$;
    pickerStateAdapter.required$ = required$;

    return pickerStateAdapter;
  }

  init(pickerStateAdapter: PickerStateAdapter): void {
    pickerStateAdapter.init();
  }
}

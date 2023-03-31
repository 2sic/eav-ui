import { Injectable } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { FieldSettings } from 'projects/edit-types';
import { BehaviorSubject, Observable } from 'rxjs';
import { ControlStatus } from '../../../shared/models';
import { EditRoutingService } from '../../../shared/services';
import { EntityCacheService, StringQueryCacheService } from '../../../shared/store/ngrx-data';
import { FieldConfigSet } from '../../builder/fields-builder/field-config-set.model';
import { PickerSearchComponent } from './picker-search/picker-search.component';
import { PickerStateAdapter } from './picker-state-adapter';
import { PickerAdapterBase } from './picker-adapter-base';

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
    pickerStateAdapter.pickerAdapterBase = pickerAdapterBase;
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

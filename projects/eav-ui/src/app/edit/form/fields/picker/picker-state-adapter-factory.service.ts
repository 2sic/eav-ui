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
import { PickerSourceAdapter } from './picker-source-adapter';
import { PickerStateAdapter } from './picker-state-adapter';

@Injectable()
export class PickerStateAdapterFactoryService {
  constructor(
    private entityCacheService: EntityCacheService,
    private stringQueryCacheService: StringQueryCacheService,
    private translateService: TranslateService,
  ) { }

  fillPickerStateAdapter(
    editRoutingService: EditRoutingService,
    config: FieldConfigSet,
    control: AbstractControl,
    entitySearchComponent: PickerSearchComponent,
    settings$: BehaviorSubject<FieldSettings>,
    controlStatus$: BehaviorSubject<ControlStatus<string | string[]>>,
    label$: Observable<string>,
    placeholder$: Observable<string>,
    required$: Observable<boolean>,
  ): PickerStateAdapter {
    const pickerStateAdapter = new PickerStateAdapter();
    pickerStateAdapter.config = config;
    pickerStateAdapter.control = control;
    pickerStateAdapter.entitySearchComponent = entitySearchComponent;
    pickerStateAdapter.translate = this.translateService;
    pickerStateAdapter.cacheEntities$ = this.entityCacheService.getEntities$();
    pickerStateAdapter.stringQueryCache$ = this.stringQueryCacheService.getEntities$(config.entityGuid, config.fieldName);
    pickerStateAdapter.settings$ = settings$;
    pickerStateAdapter.isExpanded$ = editRoutingService.isExpanded$(config.index, config.entityGuid);
    pickerStateAdapter.controlStatus$ = controlStatus$;
    pickerStateAdapter.label$ = label$;
    pickerStateAdapter.placeholder$ = placeholder$;
    pickerStateAdapter.required$ = required$;

    return pickerStateAdapter;
  }

  getDataFromPickerSourceAdapter(
    pickerStateAdapter: PickerStateAdapter,
    pickerSourceAdapter: PickerSourceAdapter
  ): PickerStateAdapter {
    pickerStateAdapter.pickerSourceAdapter = pickerSourceAdapter;
    return pickerStateAdapter;
  }

  init(pickerStateAdapter: PickerStateAdapter): void {
    pickerStateAdapter.init();
  }
}

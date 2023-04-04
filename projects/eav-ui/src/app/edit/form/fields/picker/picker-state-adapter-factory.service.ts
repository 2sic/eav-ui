import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ControlStatus } from '../../../shared/models';
import { EditRoutingService } from '../../../shared/services';
import { EntityCacheService, StringQueryCacheService } from '../../../shared/store/ngrx-data';
import { PickerStateAdapter } from './picker-state-adapter';
import { FieldSettings } from 'projects/edit-types';
import { FieldConfigSet } from '../../builder/fields-builder/field-config-set.model';
import { AbstractControl } from '@angular/forms';

@Injectable()
export class PickerStateAdapterFactoryService {
  constructor(
    private entityCacheService: EntityCacheService,
    private stringQueryCacheService: StringQueryCacheService,
    private translateService: TranslateService,
  ) { }

  createPickerStateAdapter(
    control: AbstractControl,
    config: FieldConfigSet,
    settings$: BehaviorSubject<FieldSettings>,
    editRoutingService: EditRoutingService,
    controlStatus$: BehaviorSubject<ControlStatus<string | string[]>>,
    label$: Observable<string>,
    placeholder$: Observable<string>,
    required$: Observable<boolean>,
  ): PickerStateAdapter {
    const pickerStateAdapter = new PickerStateAdapter(
      settings$,
      controlStatus$,
      editRoutingService.isExpanded$(config.index, config.entityGuid),
      label$,
      placeholder$,
      required$,
      this.entityCacheService.getEntities$(),
      this.stringQueryCacheService.getEntities$(config.entityGuid, config.fieldName),
      this.translateService,
      config,
      control,
    );

    return pickerStateAdapter;
  }

  init(pickerStateAdapter: PickerStateAdapter): void {
    pickerStateAdapter.init();
  }
}

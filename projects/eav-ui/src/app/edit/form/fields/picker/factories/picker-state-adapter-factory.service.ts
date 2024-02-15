import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ControlStatus } from '../../../../shared/models';
import { EavService, EditRoutingService } from '../../../../shared/services';
import { EntityCacheService, StringQueryCacheService } from '../../../../shared/store/ngrx-data';
import { PickerStateAdapter } from '../adapters/picker-state-adapter';
import { FieldSettings } from 'projects/edit-types';
import { FieldConfigSet } from '../../../builder/fields-builder/field-config-set.model';
import { AbstractControl } from '@angular/forms';
import { PickerStringStateAdapter } from '../adapters/picker-string-state-adapter';
import { PickerEntityStateAdapter } from '../adapters/picker-entity-state-adapter';
import { FieldDataSourceFactoryService } from './field-data-source-factory.service';
import { PickerComponent } from '../picker.component';

@Injectable()
export class PickerStateAdapterFactoryService {
  constructor(
    private entityCacheService: EntityCacheService,
    private stringQueryCacheService: StringQueryCacheService,
    private translateService: TranslateService,
    private fieldDataSourceFactoryService: FieldDataSourceFactoryService,
    private eavService: EavService,
  ) { }

  createPickerEntityStateAdapter(component: PickerComponent): PickerEntityStateAdapter{
    return this.createPickerEntityStateAdapterInternal(
      component.control,
      component.config,
      component.settings$,
      component.editRoutingService,
      component.controlStatus$,
      component.label$,
      component.placeholder$,
      component.required$,
      () => component.focusOnSearchComponent,
    )
  }

  private createPickerEntityStateAdapterInternal(
    control: AbstractControl,
    config: FieldConfigSet,
    settings$: BehaviorSubject<FieldSettings>,
    editRoutingService: EditRoutingService,
    controlStatus$: BehaviorSubject<ControlStatus<string | string[]>>,
    label$: Observable<string>,
    placeholder$: Observable<string>,
    required$: Observable<boolean>,
    focusOnSearchComponent: () => void,
  ): PickerEntityStateAdapter {
    const pickerEntityStateAdapter = new PickerEntityStateAdapter(
      settings$,
      controlStatus$,
      editRoutingService.isExpanded$(config.index, config.entityGuid),
      label$,
      placeholder$,
      required$,
      this.entityCacheService.getEntities$(),
      this.stringQueryCacheService.getEntities$(config.entityGuid, config.fieldName),
      this.fieldDataSourceFactoryService,
      this.translateService,
      control,
      this.eavService,
      focusOnSearchComponent,
    );

    return pickerEntityStateAdapter;
  }

  initEntity(pickerEntityStateAdapter: PickerEntityStateAdapter): void {
    pickerEntityStateAdapter.init();
  }

  createPickerStringStateAdapter(
    control: AbstractControl,
    config: FieldConfigSet,
    settings$: BehaviorSubject<FieldSettings>,
    editRoutingService: EditRoutingService,
    controlStatus$: BehaviorSubject<ControlStatus<string | string[]>>,
    label$: Observable<string>,
    placeholder$: Observable<string>,
    required$: Observable<boolean>,
    focusOnSearchComponent: () => void,
  ): PickerStringStateAdapter {
    const pickerStringStateAdapter = new PickerStringStateAdapter(
      settings$,
      controlStatus$,
      editRoutingService.isExpanded$(config.index, config.entityGuid),
      label$,
      placeholder$,
      required$,
      this.entityCacheService.getEntities$(),
      this.stringQueryCacheService.getEntities$(config.entityGuid, config.fieldName),
      this.translateService,
      control,
      this.eavService,
      focusOnSearchComponent,
    );

    return pickerStringStateAdapter;
  }

  initString(pickerStringStateAdapter: PickerStringStateAdapter): void {
    pickerStringStateAdapter.init();
  }

  createPickerStateAdapter(
    control: AbstractControl,
    config: FieldConfigSet,
    settings$: BehaviorSubject<FieldSettings>,
    editRoutingService: EditRoutingService,
    controlStatus$: BehaviorSubject<ControlStatus<string | string[]>>,
    label$: Observable<string>,
    placeholder$: Observable<string>,
    required$: Observable<boolean>,
    focusOnSearchComponent: () => void,
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
      control,
      this.eavService,
      focusOnSearchComponent,
    );

    return pickerStateAdapter;
  }

  init(pickerStateAdapter: PickerStateAdapter): void {
    pickerStateAdapter.init();
  }
}

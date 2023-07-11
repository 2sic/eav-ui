import { Injectable } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { EavService, EditRoutingService, EntityService, FieldsSettingsService, QueryService } from '../../../shared/services';
import { EntityCacheService, StringQueryCacheService } from '../../../shared/store/ngrx-data';
import { PickerSourceAdapter } from './picker-source-adapter';
import { DeleteEntityProps } from './picker.models';
import { BehaviorSubject } from 'rxjs';
import { FieldSettings } from 'projects/edit-types';
import { FieldConfigSet } from '../../builder/fields-builder/field-config-set.model';
import { PickerQuerySourceAdapter } from './picker-query-source-adapter';
import { PickerEntitySourceAdapter } from './picker-entity-source-adapter';
import { FieldDataSourceFactoryService } from './field-data-source-factory.service';

@Injectable()
export class PickerSourceAdapterFactoryService {
  constructor(
    private eavService: EavService,
    private entityCacheService: EntityCacheService,
    private entityService: EntityService,
    private translate: TranslateService,
    private queryService: QueryService,
    private stringQueryCacheService: StringQueryCacheService,
    private fieldDataSourceFactoryService: FieldDataSourceFactoryService,
    private snackBar: MatSnackBar,
  ) { }

  createPickerQuerySourceAdapter(
    error$: BehaviorSubject<string>,
    fieldsSettingsService: FieldsSettingsService,
    isStringQuery: boolean,
    control: AbstractControl,
    config: FieldConfigSet,
    settings$: BehaviorSubject<FieldSettings>,
    editRoutingService: EditRoutingService,
    group: FormGroup,
    deleteCallback: (props: DeleteEntityProps) => void,
  ): PickerQuerySourceAdapter {
    const pickerQuerySourceAdapter = new PickerQuerySourceAdapter(
      error$,
      fieldsSettingsService,
      this.queryService,
      this.stringQueryCacheService,
      isStringQuery,

      settings$,
      this.entityCacheService,
      this.entityService,
      this.eavService,
      editRoutingService,
      this.translate,
      config,
      group,
      this.snackBar,
      control,
      deleteCallback,
    );

    return pickerQuerySourceAdapter;
  }

  initQuery(pickerQuerySourceAdapter: PickerQuerySourceAdapter): void {
    pickerQuerySourceAdapter.init();
  }

  createPickerEntitySourceAdapter(
    disableAddNew$: BehaviorSubject<boolean>,
    fieldsSettingsService: FieldsSettingsService,
    isString: boolean,
    control: AbstractControl,
    config: FieldConfigSet,
    settings$: BehaviorSubject<FieldSettings>,
    editRoutingService: EditRoutingService,
    group: FormGroup,
    deleteCallback: (props: DeleteEntityProps) => void,
  ): PickerEntitySourceAdapter {
    const pickerEntitySourceAdapter = new PickerEntitySourceAdapter(
      disableAddNew$,
      fieldsSettingsService,
      isString,

      settings$,
      this.entityCacheService,
      this.entityService,
      this.eavService,
      editRoutingService,
      this.translate,
      this.fieldDataSourceFactoryService,
      config,
      group,
      this.snackBar,
      control,
      deleteCallback,
    );

    return pickerEntitySourceAdapter;
  }

  initEntity(pickerEntitySourceAdapter: PickerEntitySourceAdapter): void {
    pickerEntitySourceAdapter.init();
  }

  createPickerSourceAdapter(
    control: AbstractControl,
    config: FieldConfigSet,
    settings$: BehaviorSubject<FieldSettings>,
    editRoutingService: EditRoutingService,
    group: FormGroup,
    deleteCallback: (props: DeleteEntityProps) => void,
  ): PickerSourceAdapter {
    const pickerSourceAdapter = new PickerSourceAdapter(
      settings$,
      this.entityCacheService,
      this.entityService,
      this.eavService,
      editRoutingService,
      this.translate,
      config,
      group,
      this.snackBar,
      control,
      deleteCallback,
    );

    return pickerSourceAdapter;
  }

  init(pickerSourceAdapter: PickerSourceAdapter): void {
    pickerSourceAdapter.init();
  }
}

import { Injectable, Injector } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { EavService, EditRoutingService, EntityService, FieldsSettingsService, QueryService } from '../../../../shared/services';
import { EntityCacheService, StringQueryCacheService } from '../../../../shared/store/ngrx-data';
import { DeleteEntityProps } from '../picker.models';
import { BehaviorSubject } from 'rxjs';
import { FieldSettings } from 'projects/edit-types';
import { FieldConfigSet } from '../../../builder/fields-builder/field-config-set.model';
import { PickerQuerySourceAdapter } from '../adapters/picker-query-source-adapter';
import { PickerEntitySourceAdapter } from '../adapters/picker-entity-source-adapter';
import { FieldDataSourceFactoryService } from './field-data-source-factory.service';
import { PickerStringSourceAdapter } from '../adapters/picker-string-source-adapter';
import { ServiceBase } from 'projects/eav-ui/src/app/shared/services/service-base';
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';

const logThis = false;

@Injectable()
export class PickerSourceAdapterFactoryService extends ServiceBase {
  constructor(
    private injector: Injector,
    // private eavService: EavService,
    // private entityCacheService: EntityCacheService,
    // private entityService: EntityService,
    // private translate: TranslateService,
    // private queryService: QueryService,
    // private stringQueryCacheService: StringQueryCacheService,
    // private fieldDataSourceFactoryService: FieldDataSourceFactoryService,
    // private snackBar: MatSnackBar,
  ) {
    super(new EavLogger('PickerSourceAdapterFactoryService', logThis));
  }

  createPickerQuerySourceAdapter(
    error$: BehaviorSubject<string>,
    disableAddNew$: BehaviorSubject<boolean>,
    // fieldsSettingsService: FieldsSettingsService,
    isStringQuery: boolean,
    control: AbstractControl,
    config: FieldConfigSet,
    settings$: BehaviorSubject<FieldSettings>,
    // editRoutingService: EditRoutingService,
    group: FormGroup,
    deleteCallback: (props: DeleteEntityProps) => void,
  ): PickerQuerySourceAdapter {
    this.log.add('createPickerQuerySourceAdapter');
    const pickerQuerySourceAdapter = this.injector.get(PickerQuerySourceAdapter);
    // const pickerQuerySourceAdapter = new PickerQuerySourceAdapter(
    //   // error$,
    //   // disableAddNew$,
    //   fieldsSettingsService,
    //   this.queryService,
    //   this.stringQueryCacheService,
    //   // isStringQuery,

    //   // settings$,
    //   this.entityCacheService,
    //   this.entityService,
    //   this.eavService,
    //   editRoutingService,
    //   this.translate,
    //   this.fieldDataSourceFactoryService,
    //   // config,
    //   // group,
    //   this.snackBar,
    //   // control,
    //   // deleteCallback,
    // );
    pickerQuerySourceAdapter.setupShared(
      settings$,
      config,
      group,
      control,
      disableAddNew$,
      deleteCallback,
    ).setupQuery(
      error$,
      isStringQuery,
    );


    return pickerQuerySourceAdapter;
  }

  // initQuery(pickerQuerySourceAdapter: PickerQuerySourceAdapter): void {
  //   pickerQuerySourceAdapter.init();
  // }

  createPickerEntitySourceAdapter(
    disableAddNew$: BehaviorSubject<boolean>,
    // fieldsSettingsService: FieldsSettingsService,
    control: AbstractControl,
    config: FieldConfigSet,
    settings$: BehaviorSubject<FieldSettings>,
    // editRoutingService: EditRoutingService,
    group: FormGroup,
    deleteCallback: (props: DeleteEntityProps) => void,
  ): PickerEntitySourceAdapter {
    this.log.add('createPickerEntitySourceAdapter');
    const pickerEntitySourceAdapter = this.injector.get(PickerEntitySourceAdapter);
    this.log.add('createPickerEntitySourceAdapter', 'got pickerEntitySourceAdapter');
    // const pickerEntitySourceAdapter = new PickerEntitySourceAdapter(
    //   // disableAddNew$,
    //   fieldsSettingsService,

    //   // settings$,
    //   this.entityCacheService,
    //   this.entityService,
    //   this.eavService,
    //   editRoutingService,
    //   this.translate,
    //   this.fieldDataSourceFactoryService,
    //   // config,
    //   // group,
    //   this.snackBar,
    //   // control,
    //   // deleteCallback,
    // );
    pickerEntitySourceAdapter.setupShared(
      settings$,
      config,
      group,
      control,
      disableAddNew$,
      deleteCallback,
    )

    return pickerEntitySourceAdapter;
  }

  // initEntity(pickerEntitySourceAdapter: PickerEntitySourceAdapter): void {
  //   pickerEntitySourceAdapter.init();
  // }

  createPickerStringSourceAdapter(
    disableAddNew$: BehaviorSubject<boolean>,
    config: FieldConfigSet,
    settings$: BehaviorSubject<FieldSettings>,
    group: FormGroup,
    deleteCallback: (props: DeleteEntityProps) => void,
  ): PickerStringSourceAdapter {
    this.log.add('createPickerStringSourceAdapter');
    const pickerStringSourceAdapter = this.injector.get(PickerStringSourceAdapter);
    pickerStringSourceAdapter.setupString(settings$, disableAddNew$, config, group, deleteCallback);

    return pickerStringSourceAdapter;
  }

  // initString(pickerStringSourceAdapter: PickerStringSourceAdapter): void {
  //   pickerStringSourceAdapter.init();
  // }
}

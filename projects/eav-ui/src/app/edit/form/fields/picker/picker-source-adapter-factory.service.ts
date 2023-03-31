import { Injectable } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { FieldSettings } from 'projects/edit-types';
import { BehaviorSubject, config } from 'rxjs';
import { EavService, EditRoutingService, EntityService } from '../../../shared/services';
import { EntityCacheService } from '../../../shared/store/ngrx-data';
import { FieldConfigSet } from '../../builder/fields-builder/field-config-set.model';
import { PickerSearchComponent } from './picker-search/picker-search.component';
import { PickerSourceAdapter } from './picker-source-adapter';
import { PickerStateAdapter } from './picker-state-adapter';
import { PickerAdapterBase } from './picker-adapter-base';

@Injectable()
export class PickerSourceAdapterFactoryService {
  constructor(
    private eavService: EavService,
    private entityCacheService: EntityCacheService,
    private entityService: EntityService,
    private translate: TranslateService,
    private snackBar: MatSnackBar,
  ) { }

  fillPickerSourceAdapter(
    pickerAdapterBase: PickerAdapterBase,
    editRoutingService: EditRoutingService,
    group: FormGroup,
    isQuery: boolean,
    fetchEntities: (clearAvailableEntitiesAndOnlyUpdateCache: boolean) => void,
  ): PickerSourceAdapter {
    const pickerSourceAdapter = new PickerSourceAdapter();
    pickerSourceAdapter.pickerAdapterBase = pickerAdapterBase;
    pickerSourceAdapter.eavService = this.eavService;
    pickerSourceAdapter.entityCacheService = this.entityCacheService;
    pickerSourceAdapter.entityService = this.entityService;
    pickerSourceAdapter.editRoutingService = editRoutingService;
    pickerSourceAdapter.translate = this.translate;
    pickerSourceAdapter.snackBar = this.snackBar;
    pickerSourceAdapter.group = group;
    pickerSourceAdapter.isQuery = isQuery;
    pickerSourceAdapter.fetchAvailableEntities =
      (clearAvailableEntitiesAndOnlyUpdateCache: boolean) => fetchEntities(clearAvailableEntitiesAndOnlyUpdateCache);

    return pickerSourceAdapter;
  }

  init(pickerSourceAdapter: PickerSourceAdapter): void {
    pickerSourceAdapter.init();
  }
}

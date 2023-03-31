import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { EavService, EditRoutingService, EntityService } from '../../../shared/services';
import { EntityCacheService } from '../../../shared/store/ngrx-data';
import { PickerSourceAdapter } from './picker-source-adapter';
import { PickerAdapterBase } from './picker-adapter-base';
import { ReorderIndexes } from './picker-list/picker-list.models';

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
    pickerSourceAdapter.settings$ = pickerAdapterBase.settings$;
    pickerSourceAdapter.disableAddNew$ = pickerAdapterBase.disableAddNew$;
    pickerSourceAdapter.config = pickerAdapterBase.config;
    pickerSourceAdapter.control = pickerAdapterBase.control;
    pickerSourceAdapter.updateValue =
      (action: 'add' | 'delete' | 'reorder', value: string | number | ReorderIndexes) => pickerAdapterBase.updateValue(action, value);
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

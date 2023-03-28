import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { EavService, EditRoutingService, EntityService } from '../../../shared/services';
import { EntityCacheService } from '../../../shared/store/ngrx-data';
import { PickerSourceAdapter } from './picker-source-adapter';
import { PickerStateAdapter } from './picker-state-adapter';

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
    pickerSourceAdapter: PickerSourceAdapter,
    editRoutingService: EditRoutingService,
    group: FormGroup,
    isQuery: boolean,
    fetchEntities: (clearAvailableEntitiesAndOnlyUpdateCache: boolean) => void,
  ): PickerSourceAdapter {
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

  getDataFromPickerStateAdapter(
    pickerSourceAdapter: PickerSourceAdapter,
    pickerStateAdapter: PickerStateAdapter
  ): PickerSourceAdapter {
    pickerSourceAdapter.pickerStateAdapter = pickerStateAdapter;
    return pickerSourceAdapter;
  }

  init(pickerSourceAdapter: PickerSourceAdapter): void {
    pickerSourceAdapter.init();
  }
}

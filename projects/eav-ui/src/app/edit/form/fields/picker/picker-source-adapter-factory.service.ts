import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { EavService, EditRoutingService } from '../../../shared/services';
import { EntityCacheService } from '../../../shared/store/ngrx-data';
import { PickerSourceAdapter } from './picker-source-adapter';
import { PickerStateAdapter } from './picker-state-adapter';

@Injectable()
export class PickerSourceAdapterFactoryService {
  constructor(
    private eavService: EavService,
    private entityCacheService: EntityCacheService,
  ) { }

  fillPickerSourceAdapter(
    pickerSourceAdapter: PickerSourceAdapter,
    editRoutingService: EditRoutingService,
    group: FormGroup,
    isQuery: boolean,
    deleteEntity: (entity: { index: number, entityGuid: string }) => void,
    fetchEntities: (clearAvailableEntitiesAndOnlyUpdateCache: boolean) => void,
  ): PickerSourceAdapter {
    pickerSourceAdapter.eavService = this.eavService;
    pickerSourceAdapter.entityCacheService = this.entityCacheService;
    pickerSourceAdapter.editRoutingService = editRoutingService;
    pickerSourceAdapter.group = group;
    pickerSourceAdapter.isQuery = isQuery;
    pickerSourceAdapter.deleteEntity = (entity: { index: number, entityGuid: string }) => deleteEntity(entity);
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

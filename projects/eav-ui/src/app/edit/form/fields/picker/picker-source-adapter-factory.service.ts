import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { EavService } from '../../../shared/services';
import { PickerSourceAdapter } from './picker-source-adapter';
import { PickerStateAdapter } from './picker-state-adapter';

@Injectable()
export class PickerSourceAdapterFactoryService {
  constructor(
    private eavService: EavService,
  ) { }

  fillPickerSourceAdapter(
    pickerSourceAdapter: PickerSourceAdapter,
    group: FormGroup,
    isQuery: boolean,
    editEntity: (entity: { entityGuid: string, entityId: number }) => void,
    deleteEntity: (entity: { index: number, entityGuid: string }) => void,
    fetchEntities: (clearAvailableEntitiesAndOnlyUpdateCache: boolean) => void,
  ): PickerSourceAdapter {
    pickerSourceAdapter.eavService = this.eavService;
    pickerSourceAdapter.group = group;
    pickerSourceAdapter.isQuery = isQuery;
    pickerSourceAdapter.editEntity = (entity: { entityGuid: string, entityId: number }) => editEntity(entity);
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

import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { EntityInfo } from 'projects/edit-types';
import { BehaviorSubject } from 'rxjs';
import { PickerSourceAdapter } from './picker-source-adapter';

@Injectable()
export class PickerSourceAdapterFactoryService {
  constructor() { }

  fillPickerSourceAdapter(
    pickerSourceAdapter: PickerSourceAdapter,
    group: FormGroup,
    availableEntities$: BehaviorSubject<EntityInfo[]>,
    editEntity: (entity: { entityGuid: string, entityId: number }) => void,
    deleteEntity: (entity: { index: number, entityGuid: string }) => void,
    fetchEntities: (clearAvailableEntitiesAndOnlyUpdateCache: boolean) => void,
  ): PickerSourceAdapter {
    pickerSourceAdapter.group = group;
    pickerSourceAdapter.availableEntities$ = availableEntities$;
    pickerSourceAdapter.editEntity = (entity: { entityGuid: string, entityId: number }) => editEntity(entity);
    pickerSourceAdapter.deleteEntity = (entity: { index: number, entityGuid: string }) => deleteEntity(entity);
    pickerSourceAdapter.fetchAvailableEntities =
      (clearAvailableEntitiesAndOnlyUpdateCache: boolean) => fetchEntities(clearAvailableEntitiesAndOnlyUpdateCache);
    pickerSourceAdapter.init();

    return pickerSourceAdapter;
  }
}

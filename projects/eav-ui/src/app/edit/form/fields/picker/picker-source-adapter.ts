import { FormGroup } from '@angular/forms';
import { EntityInfo } from 'projects/edit-types';
import { BehaviorSubject } from 'rxjs';

export class PickerSourceAdapter {
  group: FormGroup;

  availableEntities$: BehaviorSubject<EntityInfo[]>;

  editEntity(entity: { entityGuid: string, entityId: number }) { }
  deleteEntity(entity: { index: number, entityGuid: string }) { }
  fetchAvailableEntities(clearAvailableEntitiesAndOnlyUpdateCache: boolean) { }
}

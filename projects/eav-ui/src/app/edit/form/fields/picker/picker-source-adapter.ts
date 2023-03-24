import { FormGroup } from '@angular/forms';
import { EntityInfo } from 'projects/edit-types';
import { BehaviorSubject, distinctUntilChanged, map, Subscription } from 'rxjs';
import { FieldMask } from '../../../shared/helpers';
import { EavService } from '../../../shared/services';
import { PickerStateAdapter } from './picker-state-adapter';

export class PickerSourceAdapter {
  pickerStateAdapter: PickerStateAdapter;
  eavService: EavService;
  isQuery: boolean;

  constructor(

  ) {}
  private subscriptions = new Subscription();

  group: FormGroup;
  contentTypeMask?: FieldMask;

  availableEntities$: BehaviorSubject<EntityInfo[]>;

  init() {
    // Update/Build Content-Type Mask which is used for loading the data/new etc.
    this.subscriptions.add(
      this.pickerStateAdapter.settings$.pipe(
        map(settings => settings.EntityType),
        distinctUntilChanged(),
      ).subscribe(entityType => {
        this.contentTypeMask?.destroy();
        this.contentTypeMask = new FieldMask(
          entityType,
          this.group.controls,
          () => {
            // Re-Trigger fetch data, but only on type-based pickers, not Queries
            // for EntityQuery we don't have to refetch entities because entities come from settings.Query, not settings.EntityType
            if (!this.isQuery) {
              this.availableEntities$.next(null);
            }
            this.pickerStateAdapter.updateAddNew();
          },
          null,
          this.eavService.eavConfig,
        );

        this.availableEntities$.next(null);
        this.pickerStateAdapter.updateAddNew();
      })
    );
  }

  destroy() {
    this.contentTypeMask?.destroy();

    this.subscriptions.unsubscribe();
   }

  editEntity(entity: { entityGuid: string, entityId: number }) { }
  deleteEntity(entity: { index: number, entityGuid: string }) { }
  fetchAvailableEntities(clearAvailableEntitiesAndOnlyUpdateCache: boolean) { }
}

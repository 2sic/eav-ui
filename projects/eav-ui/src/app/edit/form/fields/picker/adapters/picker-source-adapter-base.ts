import { WIPDataSourceItem } from 'projects/edit-types';
import { BehaviorSubject, Subscription } from 'rxjs';
import { DeleteEntityProps } from '../picker.models';
import { EntityFieldDataSource } from '../data-sources/entity-field-data-source';
import { QueryFieldDataSource } from '../data-sources/query-field-data-source';
import { StringFieldDataSource } from '../data-sources/string-field-data-source';
import { PickerSourceAdapter } from './picker-source-adapter';

// TODO: @SDV
// DONE - rename to PickerSourceAdapterBase 
// - should become abstract
// DONE - extract entity commands into a PickerSourceEntityAdapterBase 
// - should also be abstract
// DONE - make sure the EntityContentBlocks uses the EntitySourceAdapter
// DONE - string-source should inherit from this, but Entity/Query should inherit from PickerSourceEntityAdapterBase
// - move property `pickerDataSource` to be `dataSource` - make it private or public and NOT on the base class - and strictly typed
export class PickerSourceAdapterBase implements PickerSourceAdapter {
  public availableItems$: BehaviorSubject<WIPDataSourceItem[]> = new BehaviorSubject<WIPDataSourceItem[]>(null);
  public pickerDataSource: EntityFieldDataSource | StringFieldDataSource | QueryFieldDataSource;
  public contentType$ = new BehaviorSubject<string>('');
  public contentType: string = null;

  protected subscription = new Subscription();

  constructor(
    public deleteCallback: (props: DeleteEntityProps) => void,
  ) { }

  init() { }

  onAfterViewInit(): void { }

  destroy() {
    this.availableItems$.complete();
    this.subscription.unsubscribe();
  }

  deleteEntity(props: DeleteEntityProps): void { }

  editEntity(editParams: { entityGuid: string, entityId: number }): void { }

  fetchItems(clearAvailableItemsAndOnlyUpdateCache: boolean): void { }
}

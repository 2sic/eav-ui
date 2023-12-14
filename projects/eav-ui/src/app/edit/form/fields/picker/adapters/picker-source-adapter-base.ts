import { PickerItem } from 'projects/edit-types';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { DeleteEntityProps } from '../picker.models';
import { PickerSourceAdapter } from './picker-source-adapter';

// TODO: @SDV
// DONE - rename to PickerSourceAdapterBase 
// - should become abstract
// DONE - extract entity commands into a PickerSourceEntityAdapterBase 
// - should also be abstract
// DONE - make sure the EntityContentBlocks uses the EntitySourceAdapter
// DONE - string-source should inherit from this, but Entity/Query should inherit from PickerSourceEntityAdapterBase
// - move property `pickerDataSource` to be `dataSource` - make it private or public and NOT on the base class - and strictly typed
export abstract class PickerSourceAdapterBase implements PickerSourceAdapter {
  public availableItems$ = new BehaviorSubject<PickerItem[]>(null);
  public parameters$ = new BehaviorSubject<string>('');

  protected subscriptions = new Subscription();

  constructor(
    public deleteCallback: (props: DeleteEntityProps) => void,
  ) { }

  init() { }

  onAfterViewInit(): void { }

  destroy() {
    this.availableItems$.complete();
    this.subscriptions.unsubscribe();
  }

  getDataFromSource(): Observable<PickerItem[]> { return null; }

  abstract prefetch(contentTypeOrParameters: string, missingData: string[]): void;

  abstract deleteItem(props: DeleteEntityProps): void;

  abstract editItem(editParams: { entityGuid: string, entityId: number }): void;

  abstract fetchItems(clearAvailableItemsAndOnlyUpdateCache: boolean): void;
}

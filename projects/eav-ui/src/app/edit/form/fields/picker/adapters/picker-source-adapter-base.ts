import { PickerItem } from 'projects/edit-types';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { DeleteEntityProps } from '../picker.models';
import { PickerSourceAdapter } from './picker-source-adapter';

export abstract class PickerSourceAdapterBase implements PickerSourceAdapter {
  public availableItems$ = new BehaviorSubject<PickerItem[]>(null);
  public editEntityGuid$ = new BehaviorSubject<string>(null);

  protected subscriptions = new Subscription();

  constructor(
    public deleteCallback: (props: DeleteEntityProps) => void,
  ) { }

  init() { }

  onAfterViewInit(): void { }

  destroy() {
    this.availableItems$.complete();
    this.editEntityGuid$.complete();
    this.subscriptions.unsubscribe();
  }

  getDataFromSource(): Observable<PickerItem[]> { return null; }

  abstract setPrefetchData(missingData: string[]): void;

  abstract setOverrideData(missingData: string[]): void;

  abstract deleteItem(props: DeleteEntityProps): void;

  abstract editItem(editParams: { entityGuid: string, entityId: number }): void;

  abstract fetchItems(clearAvailableItemsAndOnlyUpdateCache: boolean): void;
}

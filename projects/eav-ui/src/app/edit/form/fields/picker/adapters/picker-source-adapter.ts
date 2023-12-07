import { WIPDataSourceItem } from "projects/edit-types";
import { BehaviorSubject, Observable } from "rxjs";
import { DeleteEntityProps } from "../picker.models";

export interface PickerSourceAdapter {
  availableItems$: BehaviorSubject<WIPDataSourceItem[]>;
  parameters$: BehaviorSubject<string>;
  contentType: string;

  init(): void;
  onAfterViewInit(): void;
  destroy(): void;
  getDataFromSource(): Observable<WIPDataSourceItem[]>;
  prefetch(contentType: string, missingData: string[]): void;
  deleteItem(props: DeleteEntityProps): void;
  editItem(editParams: { entityGuid: string, entityId: number }): void;
  fetchItems(clearAvailableItemsAndOnlyUpdateCache: boolean): void;
}
import { PickerItem } from "projects/edit-types";
import { BehaviorSubject, Observable } from "rxjs";
import { DeleteEntityProps } from "../picker.models";

export interface PickerSourceAdapter {
  availableItems$: BehaviorSubject<PickerItem[]>;
  editEntityGuid$: BehaviorSubject<string>;

  init(callerName: string): void;
  onAfterViewInit(): void;
  destroy(): void;
  getDataFromSource(): Observable<PickerItem[]>;
  setPrefetchData(missingData: string[]): void;
  forceReloadData(missingData: string[]): void;
  deleteItem(props: DeleteEntityProps): void;
  editItem(editParams: { entityGuid: string, entityId: number }, entityType: string): void;
  fetchItems(): void;
}
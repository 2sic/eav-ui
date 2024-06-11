import { PickerItem } from "projects/edit-types";
import { BehaviorSubject, Observable } from "rxjs";
import { DeleteEntityProps } from "../models/picker.models";

export interface DataAdapter {
  optionsOrHints$: BehaviorSubject<PickerItem[]>;
  editEntityGuid$: BehaviorSubject<string>;

  init(callerName: string): void;
  onAfterViewInit(): void;
  destroy(): void;
  getDataFromSource(): Observable<PickerItem[]>;
  initPrefetch(prefetchGuids: string[]): void;
  forceReloadData(missingData: string[]): void;
  deleteItem(props: DeleteEntityProps): void;
  editItem(editParams: { entityGuid: string, entityId: number }, entityType: string): void;
  fetchItems(): void;
}
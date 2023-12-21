import { PickerItem } from "projects/edit-types";
import { BehaviorSubject, Observable } from "rxjs";
import { DeleteEntityProps } from "../picker.models";

export interface PickerSourceAdapter {
  availableItems$: BehaviorSubject<PickerItem[]>;
  editEntityGuid$: BehaviorSubject<string>;

  init(): void;
  onAfterViewInit(): void;
  destroy(): void;
  getDataFromSource(): Observable<PickerItem[]>;
  setPrefetchData(missingData: string[]): void;
  setOverrideData(missingData: string[]): void;
  deleteItem(props: DeleteEntityProps): void;
  editItem(editParams: { entityGuid: string, entityId: number }): void;
  fetchItems(): void;
}
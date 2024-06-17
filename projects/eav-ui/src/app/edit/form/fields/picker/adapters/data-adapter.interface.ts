import { PickerItem } from "projects/edit-types";
import { BehaviorSubject, Observable } from "rxjs";
import { DeleteEntityProps } from "../models/picker.models";
import { Signal } from '@angular/core';

export interface DataAdapter {

  /**
   * The options to show.
   * Can be different from the underlying data, since it may have error or loading-entries.
   * This is a signal, so it can be used in the template. it will _never_ be null.
   * 
   * WIP: Currently based on the observable
   */
  optionsOrHints: Signal<PickerItem[]>;

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
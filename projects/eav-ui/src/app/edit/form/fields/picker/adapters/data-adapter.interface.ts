import { PickerItem } from "projects/edit-types";
import { DeleteEntityProps } from "../models/picker.models";
import { Signal } from '@angular/core';
import { PickerFeatures } from '../picker-features.model';

export interface DataAdapter {

  /**
   * The options to show.
   * Can be different from the underlying data, since it may have error or loading-entries.
   * This is a signal, so it can be used in the template. it will _never_ be null.
   */
  optionsOrHints: Signal<PickerItem[]>;

  editEntityGuid: Signal<string>;

  features: Signal<Partial<PickerFeatures>>;

  init(callerName: string): void;
  onAfterViewInit(): void;
  destroy(): void;
  initPrefetch(prefetchGuids: string[]): void;
  forceReloadData(missingData: string[]): void;
  deleteItem(props: DeleteEntityProps): void;
  editItem(editParams: { entityGuid: string, entityId: number }, entityType: string): void;
  fetchItems(): void;
}
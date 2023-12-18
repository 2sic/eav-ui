import { PickerItem } from 'projects/edit-types/src/EntityInfo';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';

export class DataSourceBase {
  data$: Observable<PickerItem[]>;
  protected getAll$ = new BehaviorSubject<boolean>(false);
  protected subscriptions = new Subscription();

  getAll(): void {
    this.getAll$.next(true);
  }
}

export interface trigger {
  getAll: boolean;
  prefetchOrAdd: boolean;
}
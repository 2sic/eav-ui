import { WIPDataSourceItem } from 'projects/edit-types/src/EntityInfo';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';

export class DataSourceBase {
  data$: Observable<WIPDataSourceItem[]>;
  protected getAll$ = new BehaviorSubject<boolean>(false);
  protected subscriptions = new Subscription();



  getAll(): void {
    this.getAll$.next(true);
  }

}
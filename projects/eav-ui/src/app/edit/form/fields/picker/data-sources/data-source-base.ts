import { PickerItem } from 'projects/edit-types/src/EntityInfo';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { GeneralHelpers } from '../../../../shared/helpers';

export class DataSourceBase {
  public data$: Observable<PickerItem[]>;
  public loading$: Observable<boolean>;

  protected getAll$ = new BehaviorSubject<boolean>(false);
  protected entityGuids$ = new BehaviorSubject<string[]>([]);
  protected prefetchEntityGuids$ = new BehaviorSubject<string[]>([]);
  protected subscriptions = new Subscription();

  destroy(): void { 
    this.prefetchEntityGuids$.complete();
    this.entityGuids$.complete();
    this.getAll$.complete();
    this.subscriptions.unsubscribe();
  }

  getAll(): void {
    this.getAll$.next(true);
  }

  entityGuids(entityGuids: string[]): void {
    this.entityGuids$.next(entityGuids);
  }

  prefetchEntityGuids(entityGuids: string[]): void {
    const guids = entityGuids.filter(GeneralHelpers.distinct);
    this.prefetchEntityGuids$.next(guids);
  }
}
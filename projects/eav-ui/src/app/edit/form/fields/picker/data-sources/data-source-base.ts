import { PickerItem } from 'projects/edit-types/src/EntityInfo';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { GeneralHelpers } from '../../../../shared/helpers';
import { FieldSettings } from 'projects/edit-types';

export class DataSourceBase {
  public data$: Observable<PickerItem[]>;
  public loading$: Observable<boolean>;

  protected getAll$ = new BehaviorSubject<boolean>(false);
  protected entityGuids$ = new BehaviorSubject<string[]>([]);
  protected prefetchEntityGuids$ = new BehaviorSubject<string[]>([]);
  protected subscriptions = new Subscription();

  constructor(
    protected settings$: BehaviorSubject<FieldSettings>,
  ) { }

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

  /** remove HTML tags that come from WYSIWYG */
  protected cleanStringFromWysiwyg(wysiwygString: string): string {
    const div = document.createElement("div");
    div.innerHTML = wysiwygString ?? '';
    return div.innerText || '';
  }

  protected calculateMoreFields(): string {
    const settings = this.settings$.value;
    const pickerTreeConfiguration = settings.PickerTreeConfiguration;
    const moreFields = settings.MoreFields?.split(',') ?? [];
    const queryFields = [settings.Value, settings.Label];
    const treeFields = [
      pickerTreeConfiguration?.TreeChildIdField,
      pickerTreeConfiguration?.TreeParentIdField,
      pickerTreeConfiguration?.TreeChildParentRefField,
      pickerTreeConfiguration?.TreeParentChildRefField,
    ];
    const allFields = [...['Title', 'Id', 'Guid'], ...moreFields, ...queryFields, ...treeFields].filter(x => x?.length > 0).filter(GeneralHelpers.distinct);
    return allFields.join(',');
  }
}
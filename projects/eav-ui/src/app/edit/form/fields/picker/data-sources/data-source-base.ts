import { PickerItem } from 'projects/edit-types/src/EntityInfo';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { GeneralHelpers } from '../../../../shared/helpers';
import { FieldSettings } from 'projects/edit-types';
import { QueryEntity } from '../../entity/entity-query/entity-query.models';

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

  /** fill additional properties */
  protected fillEntityInfoMoreFields(entity: QueryEntity, entityInfo: PickerItem): PickerItem {
    const settings = this.settings$.value;
    let tooltip = this.cleanStringFromWysiwyg(settings.ItemTooltip);
    let information = this.cleanStringFromWysiwyg(settings.ItemInformation);
    let helpLink = settings.ItemHelpLink ?? '';
    Object.keys(entity).forEach(key => {
      //this is because we use Value and Text as properties in PickerItem
      if (key !== 'Value' && key !== 'Text')
        entityInfo["_" + key] = entity[key];
      else
        entityInfo[key] = entity[key];
      tooltip = tooltip.replace(`[Item:${key}]`, entity[key]);
      information = information.replace(`[Item:${key}]`, entity[key]);
      helpLink = helpLink.replace(`[Item:${key}]`, entity[key]);
    });
    entityInfo._tooltip = tooltip;
    entityInfo._information = information;
    entityInfo._helpLink = helpLink;
    return entityInfo;
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
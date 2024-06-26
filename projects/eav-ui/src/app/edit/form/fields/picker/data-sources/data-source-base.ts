import { PickerItem } from 'projects/eav-ui/src/app/edit/form/fields/picker/models/picker-item.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { GeneralHelpers } from '../../../../shared/helpers';
import { FieldSettings } from 'projects/edit-types';
import { ServiceBase } from 'projects/eav-ui/src/app/shared/services/service-base';
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';
import { DataSourceMoreFieldsHelper } from './data-source-more-fields-helper';
import { DataSourceMasksHelper } from './data-source-masks-helper';
import { DataSourceHelpers } from './data-source-helpers';
import { DataWithLoading } from '../models/data-with-loading';
import { EntityBasicWithFields } from '../../../../shared/models/entity-basic';

export abstract class DataSourceBase extends ServiceBase {
  /** Stream containing the data */
  public data$: Observable<PickerItem[]>;

  /** Stream containing loading-status */
  public loading$: Observable<boolean>;

  /** Toggle to trigger a full refresh. */
  protected getAll$ = new BehaviorSubject<boolean>(false);

  /**
   * Force refresh of the entities with these guids.
   * Typically for entities which are added or updated.
   * Once an entity has run through any modification, it's safer to refresh it.
   * Since it's difficult to know which ones have been cached or not,
   * for now we'll just keep on retrieving all on each backend access.
   * In future we may enhance this, but we must be sure that previous retrievals are preserved.
   */
  protected guidsToRefresh$ = new BehaviorSubject<string[]>([]);

  protected prefetchEntityGuids$ = new BehaviorSubject<string[]>([]);

  protected settings$: BehaviorSubject<FieldSettings>;

  constructor(logSpecs: EavLogger) {
    super(logSpecs);
  }

  protected noItemsLoadingFalse: DataWithLoading<PickerItem[]> = { data: [], loading: false };
  protected noItemsLoadingTrue: DataWithLoading<PickerItem[]> = { data: [], loading: true };

  protected setup(settings$: BehaviorSubject<FieldSettings>) {
    this.settings$ = settings$;
  }

  destroy(): void {
    this.prefetchEntityGuids$.complete();
    this.guidsToRefresh$.complete();
    this.getAll$.complete();
    super.destroy();
  }

  protected fieldsHelper = new DataSourceMoreFieldsHelper();

  protected helpers = new DataSourceHelpers();

  getAll(): void {
    this.getAll$.next(true);
  }

  addToRefresh(additionalGuids: string[]): void {
    const merged = [...this.guidsToRefresh$.value, ...additionalGuids].filter(GeneralHelpers.distinct);
    this.log.add('forceLoadGuids', 'before', this.guidsToRefresh$.value, 'after', additionalGuids, 'merged', merged);
    this.guidsToRefresh$.next(merged);
  }

  initPrefetch(entityGuids: string[]): void {
    const guids = entityGuids.filter(GeneralHelpers.distinct);
    this.prefetchEntityGuids$.next(guids);
  }

  /** fill additional properties */
  protected entity2PickerItem(entity: EntityBasicWithFields, streamName: string | null, mustUseGuid: boolean): PickerItem {
    return this.getMaskHelper().entity2PickerItem(entity, streamName, mustUseGuid);
  }

  protected getMaskHelper(): DataSourceMasksHelper {
    return this.masks ??= new DataSourceMasksHelper(this.settings$.value, this.log);
  }

  /**
   * The masks to determine which fields are used for what, and how to combine them.
   * They are generated once per source, and then reused.
   */
  private masks: DataSourceMasksHelper;

  protected fieldsToRetrieve(settings: FieldSettings): string {
    return this.fieldsHelper.fieldListToRetrieveFromServer(settings);
  }

}
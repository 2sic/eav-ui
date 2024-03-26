import { PickerItem } from 'projects/edit-types/src/EntityInfo';
import { BehaviorSubject, Observable } from 'rxjs';
import { GeneralHelpers } from '../../../../shared/helpers';
import { FieldSettings } from 'projects/edit-types';
import { QueryEntity } from '../../entity/entity-query/entity-query.models';
import { ServiceBase } from 'projects/eav-ui/src/app/shared/services/service-base';
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';
import { DataSourceMoreFieldsHelper } from './data-source-more-fields-helper';
import { DataSourceMasksHelper } from './data-source-masks-helper';
import { DataSourceHelpers } from './data-source-helpers';

export abstract class DataSourceBase extends ServiceBase {
  public data$: Observable<PickerItem[]>;
  public loading$: Observable<boolean>;

  protected getAll$ = new BehaviorSubject<boolean>(false);
  protected entityGuids$ = new BehaviorSubject<string[]>([]);
  protected prefetchEntityGuids$ = new BehaviorSubject<string[]>([]);

  protected settings$: BehaviorSubject<FieldSettings>;

  constructor(
    // protected settings$: BehaviorSubject<FieldSettings>,
    logSpecs: EavLogger,
  ) {
    super(logSpecs);
  }

  setup(settings$: BehaviorSubject<FieldSettings>) {
    this.settings$ = settings$;
  }

  destroy(): void {
    this.prefetchEntityGuids$.complete();
    this.entityGuids$.complete();
    this.getAll$.complete();
    super.destroy();
  }

  protected fieldsHelper = new DataSourceMoreFieldsHelper();

  protected helpers = new DataSourceHelpers();

  getAll(): void {
    this.getAll$.next(true);
  }

  forceLoadGuids(entityGuids: string[]): void {
    this.entityGuids$.next(entityGuids);
  }

  prefetchEntityGuids(entityGuids: string[]): void {
    const guids = entityGuids.filter(GeneralHelpers.distinct);
    this.prefetchEntityGuids$.next(guids);
  }

  /** fill additional properties */
  protected entity2PickerItem(entity: QueryEntity, streamName?: string): PickerItem {
    this.masks ??= new DataSourceMasksHelper(this.settings$.value);
    return this.masks.entity2PickerItem(entity, streamName);
  }
  private masks: DataSourceMasksHelper;

  protected fieldsToRetrieve(settings: FieldSettings): string {
    return this.fieldsHelper.fieldListToRetrieveFromServer(settings);
  }

}
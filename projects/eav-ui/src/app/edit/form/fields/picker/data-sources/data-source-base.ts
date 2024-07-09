import { PickerItem } from 'projects/eav-ui/src/app/edit/form/fields/picker/models/picker-item.model';
import { BehaviorSubject } from 'rxjs';
import { FieldSettings } from 'projects/edit-types';
import { ServiceBase } from 'projects/eav-ui/src/app/shared/services/service-base';
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';
import { DataSourceMoreFieldsHelper } from './data-source-more-fields-helper';
import { DataSourceMasksHelper } from './data-source-masks-helper';
import { DataSourceHelpers } from './data-source-helpers';
import { DataWithLoading } from '../models/data-with-loading';
import { RxHelpers } from 'projects/eav-ui/src/app/shared/rxJs/rx.helpers';
import { Signal, inject, signal } from '@angular/core';
import { FieldState } from '../../../builder/fields-builder/field-state';

export abstract class DataSourceBase extends ServiceBase {
  
  /** Field State with settings etc. */
  protected fieldState = inject(FieldState);

  constructor(logSpecs: EavLogger) {
    super(logSpecs);
    this.log.a('constructor', {forField: this.fieldState.name});
  }

  /** Signal containing the data */
  public data: Signal<PickerItem[]>;

  /** Signal with loading-status */
  public loading = signal(true);

  /** Toggle to trigger a full refresh. */
  protected getAll$ = new BehaviorSubject<boolean>(false);
  protected getAll = signal(false);

  /**
   * Force refresh of the entities with these guids.
   * Typically for entities which are added or updated.
   * Once an entity has run through any modification, it's safer to refresh it.
   * Since it's difficult to know which ones have been cached or not,
   * for now we'll just keep on retrieving all on each backend access.
   * In future we may enhance this, but we must be sure that previous retrievals are preserved.
   */
  protected guidsToRefresh = signal<string[]>([]);

  protected settings = this.fieldState.settings;

  protected noItemsLoadingFalse: DataWithLoading<PickerItem[]> = { data: [], loading: false };
  protected noItemsLoadingTrue: DataWithLoading<PickerItem[]> = { data: [], loading: true };

  public setup(): this { return this; }

  destroy(): void {
    this.getAll$.complete();
    super.destroy();
  }

  protected fieldsHelper = new DataSourceMoreFieldsHelper();

  protected helpers = new DataSourceHelpers();

  triggerGetAll(): void {
    this.getAll$.next(true);
    this.getAll.set(true);
  }

  addToRefresh(additionalGuids: string[]): void {
    const l = this.log.fn('addToRefresh', null, {additionalGuids});
    const before = this.guidsToRefresh();
    const merged = [...before, ...additionalGuids].filter(RxHelpers.distinct);
    this.log.values({ before, additionalGuids, merged });
    this.guidsToRefresh.set(merged);
    l.end();
  }

  protected getMaskHelper(enableLog?: boolean): DataSourceMasksHelper {
    return new DataSourceMasksHelper(this.settings(), this.log, enableLog);
  }

  protected fieldsToRetrieve(settings: FieldSettings): string {
    return this.fieldsHelper.fieldListToRetrieveFromServer(settings);
  }

}
import { PickerItem } from '../../picker/models/picker-item.model';
import { BehaviorSubject } from 'rxjs';
import { DataSourceMoreFieldsHelper } from './data-source-more-fields-helper';
import { DataSourceMasksHelper } from './data-source-masks-helper';
import { DataSourceHelpers } from './data-source-helpers';
import { DataWithLoading } from '../models/data-with-loading';
import { Signal, inject } from '@angular/core';
import { FieldState } from '../../field-state';
import { ServiceBase } from '../../../../shared/services/service-base';
import { EavLogger } from '../../../../shared/logging/eav-logger';
import { RxHelpers } from '../../../../shared/rxJs/rx.helpers';
import { FieldSettings } from '../../../../../../../edit-types/src/FieldSettings';
import { signalObj } from '../../../../shared/signals/signal.utilities';

export abstract class DataSourceBase extends ServiceBase {

  /** Field State with settings etc. */
  protected fieldState = inject(FieldState);

  log: EavLogger;
  constructor(log: EavLogger) {
    super();
    this.log ??= log ?? new EavLogger('DataSourceBase', false);
    this.log.a('constructor', { forField: this.fieldState.name });
  }

  /** Signal containing the data */
  public data: Signal<PickerItem[]>;

  /** Signal with loading-status */
  public loading = signalObj('loading', true);

  /** Toggle to trigger a full refresh. */
  protected getAll$ = new BehaviorSubject<boolean>(false);
  protected getAll = signalObj('getAll', false);

  /**
   * Force refresh of the entities with these guids.
   * Typically for entities which are added or updated.
   * Once an entity has run through any modification, it's safer to refresh it.
   * Since it's difficult to know which ones have been cached or not,
   * for now we'll just keep on retrieving all on each backend access.
   * In future we may enhance this, but we must be sure that previous retrievals are preserved.
   */
  protected guidsToRefresh = signalObj<string[]>('guidsToRefresh', []);

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
    const l = this.log.fn('addToRefresh', { additionalGuids });
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

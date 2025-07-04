import { inject, Injectable, Signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FieldSettings } from '../../../../../../../edit-types/src/FieldSettings';
import { FieldSettingsPickerMasks, FieldSettingsPickerMerged } from '../../../../../../../edit-types/src/FieldSettings-Pickers';
import { FieldValue } from '../../../../../../../edit-types/src/FieldValue';
import { FieldSettingsWithPickerSource } from '../../../../../../../edit-types/src/PickerSources';
import { FeaturesService } from '../../../../features/features.service';
import { classLog, ClassLogger } from '../../../../shared/logging';
import { RxHelpers } from '../../../../shared/rxJs/rx.helpers';
import { ServiceBase } from '../../../../shared/services/service-base';
import { signalObj } from '../../../../shared/signals/signal.utilities';
import { DebugFields } from '../../../edit-debug';
import { FormConfigService } from '../../../form/form-config.service';
import { FieldState } from '../../field-state';
import { PickerItem } from '../../picker/models/picker-item.model';
import { DataWithLoading } from '../models/data-with-loading';
import { DataSourceHelpers } from './data-source-helpers';
import { DataSourceMasksHelper } from './data-source-masks-helper';
import { DataSourceMoreFieldsHelper } from './data-source-more-fields-helper';

export const logSpecsDataSourceBase = {
  all: false,
  constructor: false,
  data: false,
  triggerGetAll: false,
  addToRefresh: false,
  fields: [...DebugFields, 'Categories'],
  newIconOptions: false,
  fileLoadSettings: false,
}

@Injectable()
export abstract class DataSourceBase extends ServiceBase {

  abstract log: ClassLogger<typeof logSpecsDataSourceBase>;

  /** Field State with settings etc. */
  protected fieldState = inject(FieldState) as FieldState<FieldValue, FieldSettingsWithPickerSource & FieldSettingsPickerMerged>;

  /** For feature checks in the info/tooltip etc. of picker data */
  protected features = inject(FeaturesService);

  /** To get info if the current user is a developer */
  protected formConfig = inject(FormConfigService);

  protected fieldName = this.fieldState.name;

  constructor() { super(); }

  constructorEnd() {
    this.log ??= classLog({DataSourceBase});
    this.log.aIf('constructor', { forField: this.fieldState.name });
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

  ngOnDestroy(): void {
    this.getAll$.complete();
    super.ngOnDestroy();
  }

  protected fieldsHelper = new DataSourceMoreFieldsHelper();

  protected helpers = new DataSourceHelpers();

  triggerGetAll(): void {
    const l = this.log.fnIf('triggerGetAll');
    this.getAll$.next(true);
    this.getAll.set(true);
    l.end();
  }

  addToRefresh(additionalGuids: string[]): void {
    const l = this.log.fnIf('addToRefresh', { additionalGuids });
    const before = this.guidsToRefresh();
    const merged = [...before, ...additionalGuids].filter(RxHelpers.distinct);
    l.values({ before, additionalGuids, merged });
    this.guidsToRefresh.set(merged);
    l.end();
  }

  protected createMaskHelper(moreSettings?: Partial<FieldSettings & FieldSettingsPickerMasks>, enableLog?: boolean): DataSourceMasksHelper {
    return new DataSourceMasksHelper(this.fieldName, {...this.settings(), ...moreSettings }, this.features, this.formConfig, this.log, enableLog);
  }

  protected fieldsToRetrieve(settings: FieldSettingsWithPickerSource): string {
    return this.fieldsHelper.fieldListToRetrieveFromServer(settings);
  }

}

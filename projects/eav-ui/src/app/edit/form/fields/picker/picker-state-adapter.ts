import { TranslateService } from '@ngx-translate/core/public_api';
import { EntityInfo } from 'projects/edit-types';
import { BehaviorSubject, combineLatest, distinctUntilChanged, map, Observable } from 'rxjs';
import { GeneralHelpers } from '../../../shared/helpers';
import { ControlStatus } from '../../../shared/models';
import { SelectedEntity } from '../entity/entity-default/entity-default.models';
import { QueryEntity } from '../entity/entity-query/entity-query.models';
import { PickerAdapterBase } from './picker-adapter-base';
import { ReorderIndexes } from './picker-list/picker-list.models';
import { calculateSelectedEntities } from './picker.helpers';

export class PickerStateAdapter {
  pickerAdapterBase: PickerAdapterBase;
  constructor() { }

  shouldPickerListBeShown$: Observable<boolean>;
  isExpanded$: Observable<boolean>;
  freeTextMode$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  error$: BehaviorSubject<string> = new BehaviorSubject('');

  controlStatus$: BehaviorSubject<ControlStatus<string | string[]>>;

  selectedEntities$: Observable<SelectedEntity[]>;
  label$: Observable<string>;
  placeholder$: Observable<string>;
  required$: Observable<boolean>;

  allowMultiValue$: Observable<boolean>;
  cacheEntities$: Observable<EntityInfo[]>;
  stringQueryCache$: Observable<QueryEntity[]>;
  translate: TranslateService;

  init() {
    this.selectedEntities$ = combineLatest([
      this.controlStatus$.pipe(map(controlStatus => controlStatus.value), distinctUntilChanged()),
      this.cacheEntities$,
      this.stringQueryCache$,
      this.pickerAdapterBase.settings$.pipe(
        map(settings => ({
          Separator: settings.Separator,
          Value: settings.Value,
          Label: settings.Label,
        })),
        distinctUntilChanged(GeneralHelpers.objectsEqual),
      ),
    ]).pipe(
      map(([value, entityCache, stringQueryCache, settings]) =>
        calculateSelectedEntities(value, settings.Separator, entityCache, stringQueryCache, settings.Value, settings.Label, this.translate)
      ),
    );
    this.allowMultiValue$ = this.pickerAdapterBase.settings$.pipe(map(settings => settings.AllowMultiValue), distinctUntilChanged());
    this.shouldPickerListBeShown$ = combineLatest([
      this.freeTextMode$, this.isExpanded$, this.allowMultiValue$, this.selectedEntities$
    ]).pipe(map(([
      freeTextMode, isExpanded, allowMultiValue, selectedEntities
    ]) => {
      return !freeTextMode && selectedEntities.length > 0 && (!allowMultiValue || (allowMultiValue && isExpanded));
    }));
  }

  destroy() {
    this.freeTextMode$.complete();
    this.error$.complete();
  }

  addSelected(guid: string) { this.pickerAdapterBase.updateValue('add', guid); }
  removeSelected(index: number) { this.pickerAdapterBase.updateValue('delete', index); }
  reorder(reorderIndexes: ReorderIndexes) { this.pickerAdapterBase.updateValue('reorder', reorderIndexes); }

  toggleFreeTextMode(): void {
    this.freeTextMode$.next(!this.freeTextMode$.value);
  }
}

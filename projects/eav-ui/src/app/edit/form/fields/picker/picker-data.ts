import { combineLatest, distinctUntilChanged, map, shareReplay, take } from 'rxjs';
import { DataAdapter } from "./adapters/data-adapter.interface";
import { StateAdapter } from "./adapters/state-adapter";
import { PickerItem } from 'projects/edit-types';
import { RxHelpers } from '../../../../shared/rxJs/rx.helpers';
import { TranslateService } from '@ngx-translate/core';
import { ServiceBase } from 'projects/eav-ui/src/app/shared/services/service-base';
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';
import { Injector, Signal, computed, runInInjectionContext } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { PickerFeatures } from './picker-features.model';

const logThis = false;

export class PickerData extends ServiceBase {

  public selectedAll: Signal<PickerItem[]>;

  public selectedOne = computed(() => this.selectedAll()[0] ?? null);

  public features = computed(() => {
    const fromSource = this.source.features();
    const fromState = this.state.features();
    return PickerFeatures.merge(fromSource, fromState);
  });

  constructor(
    public state: StateAdapter,
    public source: DataAdapter,
    private translate: TranslateService,
    /** the injector is needed so that signals can destroy when they are not needed any more */
    injector: Injector,
  ) {
    super(new EavLogger('PickerData', logThis));

    // 1. Init Prefetch - for Entity Picker
    // This will place the prefetch items into the available-items list
    // Otherwise related entities would only show as GUIDs.
    state.selectedItems$
      .pipe(take(1))
      .subscribe(items => source.initPrefetch(items.map(item => item.value)))

    // 2. Selected Items 
    const logSelected = this.log.rxTap('selectedItems$', { enabled: true });
    const selectedItems$ = combineLatest([
      state.selectedItems$.pipe(
        distinctUntilChanged(RxHelpers.arraysEqual)
      ),
      source.getDataFromSource().pipe(
        distinctUntilChanged(RxHelpers.arraysEqual)
      ),
    ]).pipe(
      logSelected.start(),
      map(([selectedItems, data]) =>
        this.createUIModel(selectedItems, data, this.translate)
      ),
      distinctUntilChanged(RxHelpers.arraysEqual),
      shareReplay(1),
      logSelected.end(),
    );

    // Convert to signal; must happen inside the injection context
    runInInjectionContext(injector, () => {
      this.selectedAll = toSignal(selectedItems$, { initialValue: [] });
    });
  }

  override destroy() {
    this.source.destroy();
    this.state.destroy();
    super.destroy();
  }

  private createUIModel(
    selectedItems: PickerItem[],
    data: PickerItem[],
    translate: TranslateService,
  ): PickerItem[] {
    const selectedEntities = selectedItems.map(item => {
      const entity = data.find(e => e.value === item.value);
      if (!entity) {
        return item;
      } else {
        const text = entity.label ?? translate.instant('Fields.Picker.EntityNotFound');
        return this.createPickerItem(
          entity.id,
          entity.value,
          text,
          entity.tooltip ?? `${text} (${entity.value})`,
          entity.infoBox ?? '',
          entity.noEdit === true,
          entity.noDelete === true,
          false,
        );
      }
    });

    return selectedEntities;
  }

  private createPickerItem(id: number, value: string, text: string, tooltip: string, information: string, disableEdit: boolean, disableDelete: boolean, disableSelect: boolean,): PickerItem { 
    return {
      id: id,
      value: value,
      label: text,
      tooltip: tooltip,
      infoBox: information,
      noEdit: disableEdit,
      noDelete: disableDelete,
      notSelectable: disableSelect,
    } as PickerItem;
  }
}
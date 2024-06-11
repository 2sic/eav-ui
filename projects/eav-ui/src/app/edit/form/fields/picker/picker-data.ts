import { Observable, combineLatest, distinctUntilChanged, map, shareReplay, take, tap } from 'rxjs';
import { DataAdapter } from "./adapters/data-adapter.interface";
import { StateAdapter } from "./adapters/state-adapter";
import { PickerItem } from 'projects/edit-types';
import { GeneralHelpers } from '../../../shared/helpers/general.helpers';
import { TranslateService } from '@ngx-translate/core';
import { ServiceBase } from 'projects/eav-ui/src/app/shared/services/service-base';
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';

const logThis = false;

export class PickerData extends ServiceBase {

  public selectedItems$ = new Observable<PickerItem[]>;

  constructor(
    public state: StateAdapter,
    public source: DataAdapter,
    private translate: TranslateService,
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
    this.selectedItems$ = combineLatest([
      state.selectedItems$.pipe(
        distinctUntilChanged(GeneralHelpers.arraysEqual)
      ),
      source.getDataFromSource().pipe(
        distinctUntilChanged(GeneralHelpers.arraysEqual)
      ),
    ]).pipe(
      logSelected.start(),
      map(([selectedItems, data]) =>
        this.createUIModel(selectedItems, data, this.translate)
      ),
      distinctUntilChanged(GeneralHelpers.arraysEqual),
      shareReplay(1),
      logSelected.end(),
    );
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
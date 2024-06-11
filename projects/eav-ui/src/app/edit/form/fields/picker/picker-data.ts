import { Observable, combineLatest, distinctUntilChanged, map, shareReplay, take, tap } from 'rxjs';
import { DataAdapter } from "./adapters/data-adapter.interface";
import { StateAdapter } from "./adapters/state-adapter";
import { PickerItem } from 'projects/edit-types';
import { GeneralHelpers } from '../../../shared/helpers/general.helpers';
import { TranslateService } from '@ngx-translate/core';
import { ServiceBase } from 'projects/eav-ui/src/app/shared/services/service-base';
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';

const logThis = true;

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

    // TODO: @SDV include this take(1) and remove this.subscriptions after fixing an issue of why 
    // labels don't show on on picker list (or picker search if we added new items in picker list...)

    // 2024-02-13 from 2dm - reactivated take(1)
    // to ensure that the pre-selected items are set only once
    // TODO: @SDV the note above existed before, I don't know why or how long it's been there
    // pls review and remove if all is good
    // previous code
    // this.subscriptions.add(state.selectedItems$/*.pipe(take(1))*/.subscribe(items => {
    const logSelectedFirst = this.log.rxTap('selectedItems$-initPrefetch', { enabled: false });
    this.subscriptions.add(
      state.selectedItems$
        .pipe(
          logSelectedFirst.pipe(),
          take(1),
          logSelectedFirst.end(),
        )
        .subscribe(items => source.initPrefetch(items.map(item => item.value)))
      );

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
import { Observable, combineLatest, distinctUntilChanged, map, shareReplay, take, tap } from 'rxjs';
import { PickerSourceAdapter } from "./adapters/picker-source-adapter";
import { PickerStateAdapter } from "./adapters/picker-state-adapter";
import { PickerItem } from 'projects/edit-types';
import { GeneralHelpers } from '../../../shared/helpers/general.helpers';
import { TranslateService } from '@ngx-translate/core';
import { ServiceBase } from 'projects/eav-ui/src/app/shared/services/service-base';
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';

const logThis = false;

export class PickerData extends ServiceBase {
  public selectedItems$ = new Observable<PickerItem[]>;
  constructor(
    public state: PickerStateAdapter,
    public source: PickerSourceAdapter,
    private translate: TranslateService,
  ) {
    super(new EavLogger('PickerData', logThis));
    // TODO: @SDV include this take(1) and remove this.subscriptions after fixing an issue of why 
    // labels don't show on on picker list (or picker search if we added new items in picker list...)

    // 2024-02-13 from 2dm - reactivated take(1)
    // to ensure that the pre-selected items are set only once
    // TODO: @SDV the note above existed before, I don't know why or how long it's been there
    // pls review and remove if all is good
    // previous code
    // this.subscriptions.add(state.selectedItems$/*.pipe(take(1))*/.subscribe(items => {
    this.subscriptions.add(state.selectedItems$.pipe(take(1)).subscribe(items => {
      source.initPrefetch(items.map(item => item.value));
    }));

    this.selectedItems$ = combineLatest([
      state.selectedItems$.pipe(distinctUntilChanged(GeneralHelpers.arraysEqual)),
      source.getDataFromSource().pipe(distinctUntilChanged(GeneralHelpers.arraysEqual)),
    ]).pipe(
      map(([selectedItems, data]) =>
        this.createUIModel(selectedItems, data, this.translate)
      ),
      distinctUntilChanged(GeneralHelpers.arraysEqual),
      shareReplay(1),
    );
  }

  destroy() {
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
        const text = entity.label ?? translate.instant('Fields.Entity.EntityNotFound');
        return this.createPickerItem(
          entity.id,
          entity.value,
          text,
          entity.tooltip ?? `${text} (${entity.value})`,
          entity.infoBox ?? '',
          entity._disableEdit === true,
          entity._disableDelete === true,
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
      _disableEdit: disableEdit,
      _disableDelete: disableDelete,
      _disableSelect: disableSelect,
    } as PickerItem;
  }
}
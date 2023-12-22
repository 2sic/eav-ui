import { Observable, Subscription, combineLatest, distinctUntilChanged, map, shareReplay, take, tap } from 'rxjs';
import { PickerSourceAdapter } from "./adapters/picker-source-adapter";
import { PickerStateAdapter } from "./adapters/picker-state-adapter";
import { PickerItem } from 'projects/edit-types';
import { GeneralHelpers } from '../../../shared/helpers/general.helpers';
import { TranslateService } from '@ngx-translate/core';

export class PickerData {
  public selectedItems$ = new Observable<PickerItem[]>;
  private subscriptions = new Subscription();
  constructor(
    public state: PickerStateAdapter,
    public source: PickerSourceAdapter,
    private translate: TranslateService,
  ) {
    // TODO: @SDV include this take(1) and remove this.subscriptions after fixing an issue of why 
    // labels don't show on on picker list (or picker search if we added new items in picker list...)
    this.subscriptions.add(state.selectedItems$/*.pipe(take(1))*/.subscribe(items => {
      source.setPrefetchData(items.map(item => item.Value));
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
    this.subscriptions.unsubscribe();
    this.source.destroy();
    this.state.destroy();
  }

  private createUIModel(
    selectedItems: PickerItem[],
    data: PickerItem[],
    translate: TranslateService,
  ): PickerItem[] {
    const selectedEntities = selectedItems.map(item => {
      const entity = data.find(e => e.Value === item.Value);
      if (!entity) {
        return item;
      } else {
        const text = entity.Text ?? translate.instant('Fields.Entity.EntityNotFound');
        return this.createPickerItem(
          entity.Id,
          entity.Value,
          text,
          entity._tooltip ?? `${text} (${entity.Value})`,
          entity._information ?? '',
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
      Id: id,
      Value: value,
      Text: text,
      _tooltip: tooltip,
      _information: information,
      _disableEdit: disableEdit,
      _disableDelete: disableDelete,
      _disableSelect: disableSelect,
    } as PickerItem;
  }
}
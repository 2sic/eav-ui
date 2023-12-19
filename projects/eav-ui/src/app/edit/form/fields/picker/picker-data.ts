import { Observable, combineLatest, distinctUntilChanged, map, shareReplay, take, tap } from 'rxjs';
import { PickerSourceAdapter } from "./adapters/picker-source-adapter";
import { PickerStateAdapter } from "./adapters/picker-state-adapter";
import { PickerItem } from 'projects/edit-types';
import { GeneralHelpers } from '../../../shared/helpers/general.helpers';
import { TranslateService } from '@ngx-translate/core';

export class PickerData {
  public selectedItems$ = new Observable<PickerItem[]>;
  constructor(
    public state: PickerStateAdapter,
    public source: PickerSourceAdapter,
    private translate: TranslateService,
  ) {
    state.selectedItems$.pipe(take(1)).subscribe(items => {
      source.setPrefetchData(items.map(item => item.Value));
    });

    this.selectedItems$ = combineLatest([
      state.selectedItems$.pipe(distinctUntilChanged(GeneralHelpers.arraysEqual)),
      source.getDataFromSource().pipe(distinctUntilChanged(GeneralHelpers.arraysEqual)),
    ]).pipe(
      map(([selectedItems, data]) =>
        this.createUIModel(selectedItems, data, this.translate)
      ),
      distinctUntilChanged(GeneralHelpers.arraysEqual),
      // @SDV test this a bit further
      shareReplay(1),
    );
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
        const text = entity?.Text ?? translate.instant('Fields.Entity.EntityNotFound');
        const disableEdit = entity._disableEdit === true;
        const disableDelete = entity._disableDelete === true;
        const tooltip = entity._tooltip ?? `${text} (${entity.Value})`;
        const information = entity._information ?? '';

        const result: PickerItem = {
          // if it's a free text value or not found, disable edit and delete
          _disableEdit: disableEdit,
          _disableDelete: disableDelete,
          // either the real value or null if text-field or not found
          Id: entity?.Id,
          Text: text,
          _tooltip: tooltip,
          _information: information,
          Value: entity.Value,
        };

        return result;
      }
    });

    return selectedEntities;
  }
}
import { Observable, combineLatest, distinctUntilChanged, map, shareReplay, tap } from 'rxjs';
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
    this.selectedItems$ = combineLatest([
      state.selectedItems$.pipe(distinctUntilChanged(GeneralHelpers.arraysEqual)),
      source.getDataFromSource().pipe(distinctUntilChanged(GeneralHelpers.arraysEqual)),
      source.parameters$.pipe(distinctUntilChanged()),
    ]).pipe(
      map(([selectedItems, data, parameters]) =>
        this.createUIModel(selectedItems, data, parameters,
          (missingData, parameters) => source.prefetchOrAdd(missingData, parameters),
          this.translate)
      ),
      distinctUntilChanged(GeneralHelpers.arraysEqual),
      // tap((x) => console.log('SDV PICKER DATA', x)),
      // @SDV test this a bit further
      shareReplay(1),
    );
  }

  private createUIModel(
    selectedItems: PickerItem[],
    data: PickerItem[],
    parameters: string,
    prefetch: (missingData: string[], parameters: string) => void,
    translate: TranslateService,
  ): PickerItem[] {
    let missingData: string[] = [];
    const selectedEntities = selectedItems.map(item => {
      const entity = data.find(e => e.Value === item.Value);
      if (!entity) {
        missingData.push(item.Value);
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

    if (missingData.length > 0) {
      prefetch(missingData, parameters);
    }

    return selectedEntities;
  }
}
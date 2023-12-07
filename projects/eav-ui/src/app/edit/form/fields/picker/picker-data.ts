import { Observable, combineLatest, distinctUntilChanged, map } from 'rxjs';
import { PickerSourceAdapter } from "./adapters/picker-source-adapter";
import { PickerStateAdapter } from "./adapters/picker-state-adapter";
import { WIPDataSourceItem } from 'projects/edit-types';
import { GeneralHelpers } from '../../../shared/helpers/general.helpers';
import { createUIModel } from './picker.helpers';
import { TranslateService } from '@ngx-translate/core';

export class PickerData {
  public selected$ = new Observable<WIPDataSourceItem[]>;
  constructor(
    public state: PickerStateAdapter,
    public source: PickerSourceAdapter,
    // TODO: @SDV ADD THIS
    // private translate: TranslateService,
  ) {
    // TODO: @SDV
    // - activate this with translate
    // - then change all users of selectedItems$ etc. to use this instead
    // - then move the code for `createUIModel` into this class as it's the only place where it's used

    // this.selected$ = combineLatest([
    //   state.selectedItems$.pipe(distinctUntilChanged(GeneralHelpers.arraysEqual)),
    //   source.getDataFromSource().pipe(distinctUntilChanged(GeneralHelpers.arraysEqual)),
    //   source.parameters$.pipe(distinctUntilChanged()),
    // ]).pipe(
    //   //tap(([selectedItems, data, contentType]) => console.log('SDV SEARCH')),
    //   map(([selectedItems, data, parameters]) =>
    //     createUIModel(selectedItems, data, parameters,
    //       (parameters, missingData) => source.prefetch(parameters, missingData),
    //       this.translate)
    //   ),
    //   distinctUntilChanged(GeneralHelpers.arraysEqual),
    //   // tap((x) => console.log('SDV PICKER DATA', x)),
    //   // todo: consider using shareReplay(1) or similar here, so that multiple subscribers reuse the data
    // );

  }
}
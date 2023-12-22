import { DropdownOption, PickerItem, FieldSettings } from "projects/edit-types";
import { BehaviorSubject, combineLatest, distinctUntilChanged, map, of } from "rxjs";
import { DataSourceBase } from './data-source-base';


export class StringFieldDataSource extends DataSourceBase {
  constructor(
    private settings$: BehaviorSubject<FieldSettings>,
  ) {
    super();
    this.loading$ = of(false);

    const preloaded = this.settings$.pipe(map(settings => settings._options.map(option => this.stringEntityMapping(option))), distinctUntilChanged());
    this.data$ = combineLatest([
      this.getAll$.pipe(distinctUntilChanged()),
      preloaded,
    ]).pipe(map(([_, preloaded]) => preloaded));
  }

  destroy(): void {
    this.subscriptions.unsubscribe();
  }

  private stringEntityMapping(dropdownOption: DropdownOption): PickerItem {
    const entityInfo: PickerItem = {
      Value: dropdownOption.value as string,
      Text: dropdownOption.label,
    };
    return entityInfo;
  }
}
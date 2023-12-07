import { DropdownOption, PickerItem, FieldSettings } from "projects/edit-types";
import { BehaviorSubject, Observable, Subscription, combineLatest, distinctUntilChanged, map } from "rxjs";
import { DataSourceBase } from './data-source-base';


export class StringFieldDataSource extends DataSourceBase {
  // public data$: Observable<WIPDataSourceItem[]>;
  // private getAll$ = new BehaviorSubject<boolean>(false);
  // private subscriptions = new Subscription();


  constructor(
    private settings$: BehaviorSubject<FieldSettings>,
  ) {
    super();
    // this isn't needed to be done like this but it's done like this to be consistent with the other data sources
    const preloaded = this.settings$.pipe(map(settings => settings._options.map(option => this.stringEntityMapping(option))), distinctUntilChanged());
    this.data$ = combineLatest([
      this.getAll$.pipe(distinctUntilChanged()),
      preloaded,
    ]).pipe(map(([fullData, preloaded]) => fullData ? preloaded : preloaded)/*, distinctUntilChanged(GeneralHelpers.arraysEqual)*/);
  }

  destroy(): void {
    this.subscriptions.unsubscribe();
  }

  // getAll(): void {
  //   this.getAll$.next(true);
  // }

  prefetch(contentType?: string, entityGuids?: string[]): void {
    // we have data already so there isn't anything to be prefetched
  }

  private stringEntityMapping(dropdownOption: DropdownOption): PickerItem {
    const entityInfo: PickerItem = {
      Value: dropdownOption.value as string,
      Text: dropdownOption.label,
    };
    return entityInfo;
  }
}
import { DropdownOption, WIPDataSourceItem, FieldSettings } from "projects/edit-types";
import { BehaviorSubject, Observable, Subscription, combineLatest, distinctUntilChanged, map } from "rxjs";


export class StringFieldDataSource {
  public data$: Observable<WIPDataSourceItem[]>;

  private getAll$ = new BehaviorSubject<boolean>(false);
  private subscriptions = new Subscription();

  constructor(
    private settings$: BehaviorSubject<FieldSettings>,
  ) {
    // this isn't needed to be done like this but it's done like this to be consistent with the other data sources
    const preloaded = this.settings$.pipe(map(settings => settings._options.map(option => this.stringEntityMapping(option))), distinctUntilChanged());
    this.data$ = combineLatest([
      this.getAll$.pipe(distinctUntilChanged()),
      preloaded,
    ]).pipe(map(([fullData, preloaded]) => fullData ? preloaded : preloaded), distinctUntilChanged());
  }

  destroy(): void {
    this.subscriptions.unsubscribe();
  }

  getAll(): void {
    this.getAll$.next(true);
  }

  private stringEntityMapping(dropdownOption: DropdownOption): WIPDataSourceItem {
    const entityInfo: WIPDataSourceItem = {
      Value: dropdownOption.value as string,
      Text: dropdownOption.label,
    };
    return entityInfo;
  }
}
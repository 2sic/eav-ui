import { DropdownOption, WIPDataSourceItem, FieldSettings } from "projects/edit-types";
import { BehaviorSubject, Observable, Subscription, distinctUntilChanged, map } from "rxjs";


export class StringFieldDataSource {
  public data$ = new BehaviorSubject<WIPDataSourceItem[]>([]);

  private subscriptions = new Subscription();

  constructor(
    private settings$: BehaviorSubject<FieldSettings>,
  ) { }

  destroy(): void {
    this.subscriptions.unsubscribe();
  }

  fetchData(): Observable<WIPDataSourceItem[]> {
    return this.settings$.pipe(map(settings => settings._options.map(option => this.stringEntityMapping(option))), distinctUntilChanged());
  }

  private stringEntityMapping(dropdownOption: DropdownOption): WIPDataSourceItem {
    const entityInfo: WIPDataSourceItem = {
      Value: dropdownOption.value as string,
      Text: dropdownOption.label,
    };
    return entityInfo;
  }
}
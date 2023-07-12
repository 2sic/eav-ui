import { DropdownOption, EntityInfo, FieldSettings } from "projects/edit-types";
import { BehaviorSubject, Subscription, distinctUntilChanged, map } from "rxjs";

export class StringFieldDataSource {
  public data$ = new BehaviorSubject<EntityInfo[]>([]);

  private subscriptions = new Subscription();

  constructor(
    private settings$: BehaviorSubject<FieldSettings>,
  ) { }

  destroy(): void {
    this.subscriptions.unsubscribe();
  }

  fetchStringData(): void { 
    this.settings$.pipe(map(settings => settings._options.map(option => this.stringEntityMapping(option))), distinctUntilChanged())
      .subscribe(this.data$);
  }

  private stringEntityMapping(dropdownOption: DropdownOption): EntityInfo {
    const entityInfo: EntityInfo = {
      Value: dropdownOption.value as string,
      Text: dropdownOption.label,
    };
    return entityInfo;
  }
}
import { DropdownOption, PickerItem, FieldSettings } from "projects/edit-types";
import { BehaviorSubject, combineLatest, distinctUntilChanged, map, of } from "rxjs";
import { DataSourceBase } from './data-source-base';
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';


export class StringFieldDataSource extends DataSourceBase {
  constructor(
    protected settings$: BehaviorSubject<FieldSettings>,
  ) {
    super(settings$, new EavLogger('StringFieldDataSource', false));
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
    const settings = this.settings$.value;
    entityInfo._tooltip = this.cleanStringFromWysiwyg(settings.ItemTooltip);
    entityInfo._information = this.cleanStringFromWysiwyg(settings.ItemInformation);
    entityInfo._helpLink = settings.ItemLink;
    return entityInfo;
  }
}
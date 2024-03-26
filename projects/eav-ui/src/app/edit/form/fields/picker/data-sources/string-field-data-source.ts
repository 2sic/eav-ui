import { DropdownOption, PickerItem, FieldSettings } from "projects/edit-types";
import { BehaviorSubject, combineLatest, distinctUntilChanged, map, of } from "rxjs";
import { DataSourceBase } from './data-source-base';
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';
import { Injectable } from '@angular/core';

@Injectable()
export class StringFieldDataSource extends DataSourceBase {
  constructor() {
    super(new EavLogger('StringFieldDataSource', false));
  }

  setup(settings$: BehaviorSubject<FieldSettings>): void {
    super.setup(settings$);
    this.loading$ = of(false);

    const preloaded = this.settings$.pipe(
      map(settings => settings._options.map(option => this.stringEntityMapping(option))),
      distinctUntilChanged()
    );

    // TODO: @STV - I don't think this combine latest makes sense,
    // we probably never _wait_ for the getAll$ to be true - pls check/clean up
    this.data$ = combineLatest([
      this.getAll$.pipe(distinctUntilChanged()),
      preloaded,
    ]).pipe(
      map(([_, preloaded]) => preloaded)
    );
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
    entityInfo._tooltip = this.helpers.cleanStringFromWysiwyg(settings.ItemTooltip);
    entityInfo._information = this.helpers.cleanStringFromWysiwyg(settings.ItemInformation);
    entityInfo._helpLink = settings.ItemLink;
    return entityInfo;
  }
}
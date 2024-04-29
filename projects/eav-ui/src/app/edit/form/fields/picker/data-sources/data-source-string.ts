import { DropdownOption, PickerItem, FieldSettings } from "projects/edit-types";
import { BehaviorSubject, combineLatest, distinctUntilChanged, map, of, shareReplay } from "rxjs";
import { DataSourceBase } from './data-source-base';
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';
import { Injectable } from '@angular/core';

const logThis = false;
const logRx = true;

@Injectable()
export class DataSourceString extends DataSourceBase {
  constructor() {
    super(new EavLogger('DataSourceString', logThis));
  }

  setup(settings$: BehaviorSubject<FieldSettings>): this {
    this.log.add('setup', 'settings$', settings$);
    super.setup(settings$);
    this.loading$ = of(false);

    const rxLog = this.log.rxTap('data$', { enabled: logRx });
    this.data$ = this.settings$.pipe(
      rxLog.pipe(),
      map(settings => settings._options.map(option => this.stringEntityMapping(option))),
      distinctUntilChanged(),
      shareReplay(1),
    );

    return this;
  }

  destroy(): void {
    super.destroy();
  }

  private stringEntityMapping(dropdownOption: DropdownOption): PickerItem {
    const settings = this.settings$.value;
    const entityInfo: PickerItem = {
      Value: dropdownOption.value as string,
      label: dropdownOption.label,
      _tooltip: this.helpers.stripHtml(settings.ItemTooltip),
      _information: this.helpers.stripHtml(settings.ItemInformation),
      _helpLink: settings.ItemLink,
    } as PickerItem;
    return entityInfo;
  }
}
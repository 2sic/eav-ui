import { DropdownOption, PickerItem, FieldSettings } from "projects/edit-types";
import { BehaviorSubject, combineLatest, distinctUntilChanged, map, of } from "rxjs";
import { DataSourceBase } from './data-source-base';
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';
import { Injectable } from '@angular/core';

/**
 * This is the data-source we plan to attach when a picker is not configured.
 * It should only show the information that it's not configured.
 */
@Injectable()
export class PickerDataSourceEmpty extends DataSourceBase {
  constructor() {
    super(new EavLogger('PickerDataSourceEmpty', false));
  }

  setup(settings$: BehaviorSubject<FieldSettings>): void {
    super.setup(settings$);
    this.loading$ = of(false);

    const dummyItem: PickerItem = {
      Value: '',
      Text: 'No options available',
    };

    this.data$ = of([dummyItem]);
  }

  destroy(): void {
    super.destroy();
  }
}
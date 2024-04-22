import { PickerItem, FieldSettings } from "projects/edit-types";
import { BehaviorSubject, of, shareReplay, tap } from "rxjs";
import { DataSourceBase } from './data-source-base';
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';
import { Injectable } from '@angular/core';

const logThis = false;

/**
 * This is the data-source we plan to attach when a picker is not configured.
 * It should only show the information that it's not configured.
 */
@Injectable()
export class DataSourceEmpty extends DataSourceBase {
  constructor() {
    super(new EavLogger('PickerDataSourceEmpty', logThis));
  }

  setup(settings$: BehaviorSubject<FieldSettings>): this {
    this.log.add('setup');
    super.setup(settings$);
    this.loading$ = of(false);

    const dummyItem: PickerItem = {
      Value: '',
      Text: 'No options available',
    };

    this.data$ = of([dummyItem]).pipe(
      shareReplay(1),
      tap(data => this.log.add('data$', data))
    );
    return this;
  }

  destroy(): void {
    super.destroy();
  }
}
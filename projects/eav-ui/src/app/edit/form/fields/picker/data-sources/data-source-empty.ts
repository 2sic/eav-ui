import { PickerItem, FieldSettings } from "projects/edit-types";
import { BehaviorSubject, of, shareReplay } from "rxjs";
import { DataSourceBase } from './data-source-base';
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';
import { Injectable, Signal, computed, signal } from '@angular/core';

const logThis = false;

/**
 * This is the data-source we plan to attach when a picker is not configured.
 * It should only show the information that it's not configured.
 */
@Injectable()
export class DataSourceEmpty extends DataSourceBase {
  constructor() {
    super(new EavLogger('DataSourceEmpty', logThis));
  }

  private label = signal('');

  public preSetup(label: string): this {
    this.label.set(label);
    return this;
  }

  public override data = computed(() => [{
    value: '',
    label: this.label() ?? 'No options available',
    notSelectable: true,
    isMessage: true,
  }]);

  public override setup(settings: Signal<FieldSettings>): this {
    this.log.a('setup');
    super.setup(settings);
    this.loading$ = of(false);

    const dummyItem: PickerItem = {
      value: '',
      label: this.label() ?? 'No options available',
      notSelectable: true,
      isMessage: true,
    };

    const logData = this.log.rxTap('data$');
    this.data$ = of([dummyItem]).pipe(
      shareReplay(1),
      logData.shareReplay(),
    );
    return this;
  }
}
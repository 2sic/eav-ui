import { DataSourceBase } from './data-source-base';
import { Injectable, computed, signal } from '@angular/core';
import { EavLogger } from '../../../../shared/logging/eav-logger';

const logThis = false;
const nameOfThis = 'DataSourceEmpty';

/**
 * This is the data-source we plan to attach when a picker is not configured.
 * It should only show the information that it's not configured.
 */
@Injectable()
export class DataSourceEmpty extends DataSourceBase {

  loading = signal(false);

  constructor() {
    super(new EavLogger(nameOfThis, logThis));
  }

  private label = signal(`something is wrong - using ${nameOfThis}`);

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

}

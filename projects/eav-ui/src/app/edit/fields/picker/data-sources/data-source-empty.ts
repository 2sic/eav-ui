import { DataSourceBase } from './data-source-base';
import { Injectable } from '@angular/core';
import { signalObj, computedObj } from '../../../../shared/signals/signal.utilities';
import { classLog } from '../../../../shared/logging';

/**
 * This is the data-source we plan to attach when a picker is not configured.
 * It should only show the information that it's not configured.
 */
@Injectable()
export class DataSourceEmpty extends DataSourceBase {

  log = classLog({DataSourceEmpty});

  loading = signalObj('loading', false);

  constructor() {
    super();
  }
  

  #label = signalObj('label', `something is wrong - using DataSourceEmpty`);

  public preSetup(label: string): this {
    this.#label.set(label);
    return this;
  }

  public override data = computedObj('data', () => [{
    value: '',
    label: this.#label() ?? 'No options available',
    notSelectable: true,
    isMessage: true,
  }]);

}

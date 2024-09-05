import { DataSourceBase } from './data-source-base';
import { Injectable } from '@angular/core';
import { EavLogger } from '../../../../shared/logging/eav-logger';
import { signalObj, computedObj } from '../../../../shared/signals/signal.utilities';
import { LogSpecs } from '../../../../shared/logging/log-specs';

const logSpecs: LogSpecs = {
  enabled: true,
  name: 'DataSourceEmpty',
};

/**
 * This is the data-source we plan to attach when a picker is not configured.
 * It should only show the information that it's not configured.
 */
@Injectable()
export class DataSourceEmpty extends DataSourceBase {

  loading = signalObj('loading', false);

  constructor() {
    super(new EavLogger(logSpecs));
  }
  

  #label = signalObj('label', `something is wrong - using ${logSpecs.name}`);

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

import { DataSourceBase, logSpecsDataSourceBase } from './data-source-base';
import { Injectable } from '@angular/core';
import { DataSourceMasksHelper } from './data-source-masks-helper';
import { EntityBasicWithFields } from '../../../../shared/models/entity-basic';
import { computedObj, signalObj } from '../../../../shared/signals/signal.utilities';
import { classLog } from 'projects/eav-ui/src/app/shared/logging';

const logSpecs = {
  ...logSpecsDataSourceBase,
  data: true,
};

@Injectable()
export class DataSourceString extends DataSourceBase {

  log = classLog({DataSourceString}, logSpecs);
  
  constructor() { super(); this.constructorEnd() }

  loading = signalObj('loading', false);

  #dataMaskHelper = (() => {
    // Make sure the converter/builder uses the "Value" field for the final 'value'
    const maskHelper = new DataSourceMasksHelper(this.settings(), this.log);
    maskHelper.patchMasks({ value: 'Value' })
    return maskHelper;
  })();

  data = computedObj('data', () => {
    const options = this.settings()._options;
    const maskHelper = this.#dataMaskHelper;
    const l = this.log.fnIf('data', { options, maskHelper });
    const result = options.map(option => {
      const entity: EntityBasicWithFields = {
        Id: null,
        Guid: null,
        Title: option.label,
        // These are also for use in Formulas or masks.
        Value: option.value,
      };
      const pickerItem = maskHelper.entity2PickerItem({ entity, streamName: null, mustUseGuid: false });
      l.a('final data', { entity, pickerItem });
      return pickerItem;
    });
    return l.r(result);
  })

}

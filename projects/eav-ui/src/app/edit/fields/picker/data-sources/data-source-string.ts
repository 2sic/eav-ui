import { Injectable } from '@angular/core';
import { EntityLight } from '../../../../../../../edit-types/src/EntityLight';
import { classLog } from '../../../../shared/logging';
import { computedObj, signalObj } from '../../../../shared/signals/signal.utilities';
import { DataSourceBase, logSpecsDataSourceBase } from './data-source-base';
import { DataSourceMasksHelper } from './data-source-masks-helper';

const logSpecs = {
  ...logSpecsDataSourceBase,
  data: true,
};

@Injectable()
export class DataSourceString extends DataSourceBase {

  log = classLog({DataSourceString}, logSpecs);
  
  constructor() {
    super();
    this.constructorEnd();
  }

  loading = signalObj('loading', false);

  #dataMaskHelper = (() => {
    // Make sure the converter/builder uses the "Value" field for the final 'value'
    const maskHelper = new DataSourceMasksHelper(this.fieldName, this.settings(), this.features, this.formConfig, this.log);
    maskHelper.patchMasks({ value: 'Value' })
    return maskHelper;
  })();

  data = computedObj('data', () => {
    const options = this.settings()._options;
    const maskHelper = this.#dataMaskHelper;
    const l = this.log.fnIfInList('data', 'fields', this.fieldName, { options, maskHelper });
    const result = options.map(option => {
      const entity: EntityLight = {
        Id: null,
        Guid: null,
        ...option,  // Must contain at least Title / Value
      };
      const pickerItem = maskHelper.data2PickerItem({ entity, streamName: null, valueMustUseGuid: false });
      l.a('one item', { entity, pickerItem });
      return pickerItem;
    });
    return l.r(result);
  })

}

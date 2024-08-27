import { DataSourceBase } from './data-source-base';
import { Injectable, computed, signal } from '@angular/core';
import { DataSourceMasksHelper } from './data-source-masks-helper';
import { EavLogger } from '../../../../shared/logging/eav-logger';
import { EntityBasicWithFields } from '../../../../shared/models/entity-basic';

const logThis = false;
const nameOfThis = 'DataSourceString';
const logChildren = false;

@Injectable()
export class DataSourceString extends DataSourceBase {

  loading = signal(false);

  private dataMaskHelper = (() => {
    // Make sure the converter/builder uses the "Value" field for the final 'value'
    const maskHelper = new DataSourceMasksHelper(this.settings(), this.log);
    maskHelper.patchMasks({ value: 'Value' })
    return maskHelper;
  })();

  data = computed(() => {
    const sets = this.settings();
    return sets._options.map(option => {
      const asEntity: EntityBasicWithFields = {
        Id: null,
        Guid: null,
        Title: option.label,
        // These are only added for use in Formulas or masks.
        Value: option.value,
      };
      // TODO: @2dm fix bug, the value should be provided by entity2PickerItem
      // but it's not - probably something we must ensure with the mask...?
      const pickerItem = this.dataMaskHelper.entity2PickerItem({ entity: asEntity, streamName: null, mustUseGuid: false });
      this.log.a('final data', { pickerItem });
      return pickerItem;
    });
  })

  constructor() {
    super(new EavLogger(nameOfThis, logThis, logChildren));
  }

}

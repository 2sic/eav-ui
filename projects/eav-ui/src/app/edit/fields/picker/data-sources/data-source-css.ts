import { Injectable } from '@angular/core';
import { getWith } from '../../../../../../../core/object-utilities';
import { EntityLight } from '../../../../../../../edit-types/src/EntityLight';
import { classLog } from '../../../../shared/logging';
import { computedObj, signalObj } from '../../../../shared/signals/signal.utilities';
import { ScriptsLoaderService } from '../../../shared/services/scripts-loader.service';
import { findAllIconsInCss } from './css/string-font-icon-picker.helpers';
import { IconOption } from './css/string-font-icon-picker.models';
import { DataSourceBase, logSpecsDataSourceBase } from './data-source-base';
import { DataSourceMasksHelper } from './data-source-masks-helper';

const logSpecs = {
  ...logSpecsDataSourceBase,
  data: false,
  newIconOptions: true,
  fileLoadSettings: false,
  fields: [...logSpecsDataSourceBase.fields, '*'],
};

@Injectable()
export class DataSourceCss extends DataSourceBase {

  log = classLog({ DataSourceCss }, logSpecs, true);

  constructor(private scriptsLoaderService: ScriptsLoaderService) {
    super();
    this.constructorEnd();
    this.log.fnIf('fileLoadSettings', this.fileLoadSettings());

    const settings = this.fileLoadSettings();
    this.scriptsLoaderService.load(settings.CssSourceFile.split('\n'), () => {
      const newIconOptions = findAllIconsInCss(settings.CssSelectorFilter, false);
      this.log.fnIf('newIconOptions', { settings, newIconOptions });
      this.#iconOptions.set(newIconOptions);
    });

  }

  loading = signalObj('loading', false);

  #settings = this.fieldState.settings;
  #iconOptions = signalObj<IconOption[]>('iconOptions', []);

  fileLoadSettings = computedObj('fileLoadSettings', () => getWith(this.#settings(), s => ({
    CssSourceFile: s.CssSourceFile,
    CssSelectorFilter: s.CssSelectorFilter,
    PreviewValue: s.PreviewValue,
    Value: s.Value,
  })));



  #dataMaskHelper = (() => {
    // Make sure the converter/builder uses the "Value" field for the final 'value'
    const s = this.settings();
    const maskHelper = new DataSourceMasksHelper(this.fieldName, { ...s, Label: s.Label || 'Value' }, this.features, this.formConfig, this.log);
    return maskHelper;
  })();

  data = computedObj('data', () => {

    const options = this.#iconOptions();

    const maskHelper = this.#dataMaskHelper;
    const l = this.log.fnIfInList('data', 'fields', this.fieldName, { options, maskHelper });

    const result = options.map(option => {
      const entity: EntityLight = {
        Id: null,
        Guid: null,
        Title: option.label,
        Value: option.class,
        ValueRaw: option.valueRaw,
        Selector: option.selector,
      };

      l.values({ entity });

      const pickerItem = maskHelper.data2PickerItem({ entity, streamName: null, valueMustUseGuid: false });
      l.a('one item', { entity, pickerItem });
      return pickerItem;
    });
    return l.r(result);
  })

}

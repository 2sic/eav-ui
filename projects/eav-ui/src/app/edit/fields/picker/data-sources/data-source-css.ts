import { Injectable } from '@angular/core';
import { EntityLight } from 'projects/edit-types/src/EntityLight';
import { getWith } from '../../../../../../../core/object-utilities';
import { classLog } from '../../../../shared/logging';
import { computedObj, signalObj } from '../../../../shared/signals/signal.utilities';
import { ScriptsLoaderService } from '../../../shared/services/scripts-loader.service';
import { findAllIconsInCss } from './css/string-font-icon-picker.helpers';
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

  log = classLog({ DataSourceCss }, logSpecs);

  constructor(private scriptsLoaderService: ScriptsLoaderService) {
    super();
    this.constructorEnd();
    this.log.fnIf('fileLoadSettings', this.fileLoadSettings());

    const settings = this.fileLoadSettings();
    this.scriptsLoaderService.load(settings.CssSourceFile.split('\n'), () => {
      const newIconOptions = findAllIconsInCss(settings.CssSelectorFilter, false);
      this.log.fnIf('newIconOptions', { settings, newIconOptions });
      this.#iconEntities.set(newIconOptions);
    });

  }

  loading = signalObj('loading', false);

  #settings = this.fieldState.settings;
  #iconEntities = signalObj<EntityLight[]>('iconOptions', []);

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

    const options = this.#iconEntities();
    const maskHelper = this.#dataMaskHelper;

    const l = this.log.fnIfInFields('data', this.fieldName, { options, maskHelper });

    const result = options.map(entity => {
      const pickerItem = maskHelper.data2PickerItem({ entity, streamName: null, valueMustUseGuid: false });
      l.a('one item', { entity, pickerItem });
      return pickerItem;
    });
    return l.r(result);
  })

}

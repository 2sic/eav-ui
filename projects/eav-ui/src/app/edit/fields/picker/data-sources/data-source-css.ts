import { effect, Injectable } from '@angular/core';
import { getWith } from 'projects/eav-ui/src/app/core';
import { EntityLight } from 'projects/eav-ui/src/app/shared/models/entity-basic';
import { classLog } from '../../../../shared/logging/logging';
import { computedObj, signalObj } from '../../../../shared/signals/signal.utilities';
import { ScriptsLoaderService } from '../../../shared/services/scripts-loader.service';
import { findAllIconsInCss } from '../../basic/string-font-icon-picker/string-font-icon-picker.helpers';
import { IconOption } from '../../basic/string-font-icon-picker/string-font-icon-picker.models';
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

  loading = signalObj('loading', false);

  #settings = this.fieldState.settings;
  #iconOptions = signalObj<IconOption[]>('iconOptions', []);

  fileLoadSettings = computedObj('fileLoadSettings', () => getWith(this.#settings(), s => ({
    CssSourceFile: s.CssSourceFile,
    CssSelectorFilter: s.CssSelectorFilter,
    ValuePreview: s.ValuePreview,
    Value: s.Value,
  })));


  constructor(private scriptsLoaderService: ScriptsLoaderService) {
    super();
    this.constructorEnd();

    this.log.fnIf('fileLoadSettings', this.fileLoadSettings());

    effect(() => {
      const settings = this.fileLoadSettings();
      this.scriptsLoaderService.load(settings.CssSourceFile.split('\n'), () => {
        const newIconOptions = findAllIconsInCss(settings.CssSelectorFilter, false, settings.ValuePreview, settings.Value);
        this.log.fnIf('newIconOptions', { settings, newIconOptions });
        this.#iconOptions.set(newIconOptions);
      });
    }, { allowSignalWrites: true });
  }


  #dataMaskHelper = (() => {
    // Make sure the converter/builder uses the "Value" field for the final 'value'
    const maskHelper = new DataSourceMasksHelper(this.fieldName, this.settings(), this.features, this.formConfig, this.log);

    maskHelper.patchMasks({ label: 'Value' })
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
        Value: option.class, // kein . / string
        ValueRaw: option._valueRaw,
        Selector: option._selector,
      };

      l.values({ entity });

      const pickerItem = maskHelper.entity2PickerItem({ entity, streamName: null, mustUseGuid: false });
      l.a('one item', { entity, pickerItem });
      return pickerItem;
    });
    return l.r(result);
  })

}

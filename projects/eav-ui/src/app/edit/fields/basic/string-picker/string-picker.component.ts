import { Component, OnDestroy, OnInit } from '@angular/core';
import { StringPickerLogic } from './string-picker-logic';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { PickerConfigModels } from '../../picker/constants/picker-config-model.constants';
import { PickerImports } from '../../picker/picker-providers.constant';
import { DataAdapterEntity } from '../../picker/adapters/data-adapter-entity';
import { DataAdapterQuery } from '../../picker/adapters/data-adapter-query';
import { DataAdapterString } from '../../picker/adapters/data-adapter-string';
import { StateAdapterString } from '../../picker/adapters/state-adapter-string';
import { DeleteEntityProps } from '../../picker/models/picker.models';
import { PickerComponent } from '../../picker/picker.component';
import { transient } from '../../../../core/transient';
import { EavLogger } from '../../../../shared/logging/eav-logger';

const logSpecs = {
  name: 'StringPickerComponent',
  enabled: true,
};

@Component({
  selector: InputTypeCatalog.StringPicker,
  templateUrl: '../../picker/picker.component.html',
  styleUrls: ['../../picker/picker.component.scss'],
  standalone: true,
  imports: PickerImports,
})
export class StringPickerComponent extends PickerComponent implements OnInit, OnDestroy {

  private stateString = transient(StateAdapterString);

  constructor() {
    super(new EavLogger(logSpecs));
    StringPickerLogic.importMe();

    // this.pickerDataFactory.setupPickerData(this.pickerData, this.fieldState);
  }

  // public override ngOnInit(): void {
  //   this.log.a('ngOnInit');
  //   // this.pickerDataFactory.setupPickerData(this.pickerData, this.fieldState);
  //   super.ngOnInit();
  // }

  protected override createPickerAdapters(): void {
    this.log.a('createPickerAdapters');

    let source: DataAdapterString | DataAdapterQuery | DataAdapterEntity;

    const state = this.stateString.linkLog(this.log).attachCallback(this.focusOnSearchComponent);

    const dataSourceType = this.fieldState.settings().DataSourceType;
    const isEmpty = !dataSourceType;

    if (dataSourceType === PickerConfigModels.UiPickerSourceCustomList || isEmpty) {
      source = transient(DataAdapterString, this.injector).setupString(
        (props: DeleteEntityProps) => state.doAfterDelete(props),
        isEmpty,
      );
    }
    else if (dataSourceType === PickerConfigModels.UiPickerSourceQuery)
      source = transient(DataAdapterQuery, this.injector).linkLog(this.log).connectState(state, false);
    else if (dataSourceType === PickerConfigModels.UiPickerSourceEntity)
      source = transient(DataAdapterEntity, this.injector).linkLog(this.log).connectState(state, false);


    this.pickerData.setup(logSpecs.name, state, source);
  }
}

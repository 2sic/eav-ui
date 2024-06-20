import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { PickerComponent } from '../../picker/picker.component';
import { PickerImports, PickerProviders } from '../../picker/picker-providers.constant';
import { DeleteEntityProps } from '../../picker/models/picker.models';
import { StringPickerLogic } from './string-picker-logic';
import { DataAdapterString } from '../../picker/adapters/data-adapter-string';
import { DataAdapterQuery } from '../../picker/adapters/data-adapter-query';
import { DataAdapterEntity } from '../../picker/adapters/data-adapter-entity';
import { PickerConfigModels } from '../../picker/constants/picker-config-model.constants';
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';
import { StateAdapterString } from '../../picker/adapters/state-adapter-string';

const logThis = false;
const nameOfThis = 'StringPickerComponent';

@Component({
  selector: InputTypeConstants.StringPicker,
  templateUrl: '../../picker/picker.component.html',
  styleUrls: ['../../picker/picker.component.scss'],
  providers: PickerProviders,
  standalone: true,
  imports: PickerImports,
})
export class StringPickerComponent extends PickerComponent implements OnInit, OnDestroy {

  private sourceAdapterStringRaw = inject(DataAdapterString);
  private stateAdapterStringRaw = inject(StateAdapterString);
  private pickerEntitySourceAdapter = inject(DataAdapterEntity);
  private querySourceAdapterRaw = inject(DataAdapterQuery);

  constructor() {
    super(new EavLogger(nameOfThis, logThis));
    StringPickerLogic.importMe();
  }

  protected override createPickerAdapters(): void {
    this.log.a('createPickerAdapters');

    let source: DataAdapterString | DataAdapterQuery | DataAdapterEntity;

    const state = this.stateAdapterStringRaw.attachToComponent(this);

    const dataSourceType = this.fieldState.settings().DataSourceType;
    const isEmpty = !dataSourceType;

    if (dataSourceType === PickerConfigModels.UiPickerSourceCustomList || isEmpty) {
      source = this.sourceAdapterStringRaw.setupString(
        (props: DeleteEntityProps) => state.doAfterDelete(props),
        isEmpty,
      );
    }
    else if (dataSourceType === PickerConfigModels.UiPickerSourceQuery)
      source = this.querySourceAdapterRaw.linkLog(this.log).setupFromComponent(state, false);
    else if (dataSourceType === PickerConfigModels.UiPickerSourceEntity)
      source = this.pickerEntitySourceAdapter.linkLog(this.log).setupFromComponent(state, false);


    this.pickerData.setup(nameOfThis, state, source);
  }
}

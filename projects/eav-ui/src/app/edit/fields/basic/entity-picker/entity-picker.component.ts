import { Component, OnDestroy, OnInit } from '@angular/core';
import { EntityPickerLogic } from './entity-picker-logic';
import { PickerConfigModels } from '../../picker/constants/picker-config-model.constants';
import { DataAdapterEntity } from '../../picker/adapters/data-adapter-entity';
import { DataAdapterQuery } from '../../picker/adapters/data-adapter-query';
import { StateAdapterEntity } from '../../picker/adapters/state-adapter-entity';
import { PickerImports } from '../../picker/picker-providers.constant';
import { PickerComponent } from '../../picker/picker.component';
import { InputTypeConstants } from '../../../../content-type-fields/constants/input-type.constants';
import { transient } from '../../../../core/transient';
import { EavLogger } from '../../../../shared/logging/eav-logger';

const logThis = false;
const nameOfThis = 'EntityPickerComponent';

@Component({
  selector: InputTypeConstants.EntityPicker,
  templateUrl: '../../picker/picker.component.html',
  styleUrls: ['../../picker/picker.component.scss'],
  standalone: true,
  imports: PickerImports,
})
export class EntityPickerComponent extends PickerComponent implements OnInit, OnDestroy {
  private stateRaw = transient(StateAdapterEntity);

  constructor() {
    super(new EavLogger(nameOfThis, logThis));
    EntityPickerLogic.importMe();
  }

  protected override createPickerAdapters(): void {
    const nameOfMethod = 'createPickerAdapters';
    this.log.a(nameOfMethod);
    let source: DataAdapterQuery | DataAdapterEntity;

    const state = this.stateRaw.linkLog(this.log).attachCallback(this.focusOnSearchComponent);

    const dataSourceType = this.fieldState.settings().DataSourceType;
    this.log.a(`${nameOfMethod}: dataSourceType: '${dataSourceType}'`);

    if (dataSourceType === PickerConfigModels.UiPickerSourceEntity) {
      this.log.a(`${nameOfMethod}: UiPickerSourceEntity`);
      source = transient(DataAdapterEntity, this.injector).linkLog(this.log).connectState(state, false);
    } else if (dataSourceType === PickerConfigModels.UiPickerSourceQuery) {
      this.log.a(`${nameOfMethod}: UiPickerSourceQuery`);
      source = transient(DataAdapterQuery, this.injector).linkLog(this.log).connectState(state, false);
    } else {
      // not configured yet, should get some empty-not-configured source
      source = transient(DataAdapterEntity, this.injector).linkLog(this.log).connectState(state, true);
    }

    this.pickerData.setup(nameOfThis, state, source);
  }
}

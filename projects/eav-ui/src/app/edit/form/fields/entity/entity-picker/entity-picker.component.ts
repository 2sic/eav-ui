import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { InputTypeConstants } from 'projects/eav-ui/src/app/content-type-fields/constants/input-type.constants';
import { PickerComponent } from '../../picker/picker.component';
import { PickerImports, PickerProviders } from '../../picker/picker-providers.constant';
import { EntityPickerLogic } from './entity-picker-logic';
import { DataAdapterQuery } from '../../picker/adapters/data-adapter-query';
import { DataAdapterEntity } from '../../picker/adapters/data-adapter-entity';
import { PickerConfigModels } from '../../picker/constants/picker-config-model.constants';
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';
import { StateAdapterEntity } from '../../picker/adapters/state-adapter-entity';

const logThis = false;
const nameOfThis = 'EntityPickerComponent';

@Component({
  selector: InputTypeConstants.EntityPicker,
  templateUrl: '../../picker/picker.component.html',
  styleUrls: ['../../picker/picker.component.scss'],
  providers: PickerProviders,
  standalone: true,
  imports: PickerImports,
})
export class EntityPickerComponent extends PickerComponent implements OnInit, OnDestroy {
  private stateRaw = inject(StateAdapterEntity);
  private entitySourceAdapterRaw = inject(DataAdapterEntity);
  private querySourceAdapterRaw = inject(DataAdapterQuery);

  constructor() {
    super(new EavLogger(nameOfThis, logThis));
    EntityPickerLogic.importMe();
  }

  protected override createPickerAdapters(): void {
    this.log.a('createPickerAdapters');
    let source: DataAdapterQuery | DataAdapterEntity;

    const state = this.stateRaw.attachToComponent(this);

    const dataSourceType = this.fieldState.settings().DataSourceType;
    this.log.a(`createPickerAdapters: dataSourceType: '${dataSourceType}'`);

    if (dataSourceType === PickerConfigModels.UiPickerSourceEntity) {
      this.log.a('createPickerAdapters: PickerConfigModels.UiPickerSourceEntity');
      source = this.entitySourceAdapterRaw.linkLog(this.log).setupFromComponent(state, false);
    } else if (dataSourceType === PickerConfigModels.UiPickerSourceQuery) {
      this.log.a('createPickerAdapters: PickerConfigModels.UiPickerSourceQuery');
      source = this.querySourceAdapterRaw.linkLog(this.log).setupFromComponent(state, false);
    } else {
      // not configured yet, should get some empty-not-configured source
      source = this.entitySourceAdapterRaw.linkLog(this.log).setupFromComponent(state, true);
    }

    this.pickerData.setup(nameOfThis, state, source);
  }
}

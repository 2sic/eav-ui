import { Component, OnDestroy, OnInit } from '@angular/core';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { PickerComponent } from '../../picker/picker.component';
import { PickerImports } from '../../picker/picker-providers.constant';
import { EntityQueryLogic } from './entity-query-logic';
import { StateAdapterEntity } from '../../picker/adapters/state-adapter-entity';
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';
import { DataAdapterQuery } from '../../picker/adapters/data-adapter-query';
import { transient } from 'projects/eav-ui/src/app/core';

const logThis = false;
const nameOfThis = 'EntityQueryComponent';

@Component({
  selector: InputTypeConstants.EntityQuery,
  templateUrl: '../../picker/picker.component.html',
  styleUrls: ['../../picker/picker.component.scss'],
  standalone: true,
  imports: PickerImports,
})
export class EntityQueryComponent extends PickerComponent implements OnInit, OnDestroy {

  private stateEntity = transient(StateAdapterEntity);
  protected querySourceAdapterRaw = transient(DataAdapterQuery);

  constructor() {
    super(new EavLogger(nameOfThis, logThis));
    this.log.a('constructor');
    EntityQueryLogic.importMe();
  }

  protected override createPickerAdapters(): void {
    this.log.a('createPickerAdapters');
    const state = this.stateEntity.linkLog(this.log).attachCallback(this.focusOnSearchComponent);

    this.log.a('createPickerAdapters: PickerConfigModels.UiPickerSourceQuery');
    const source = this.querySourceAdapterRaw.linkLog(this.log).connectState(state, false);

    this.pickerData.setup(nameOfThis, state, source);
  }
}

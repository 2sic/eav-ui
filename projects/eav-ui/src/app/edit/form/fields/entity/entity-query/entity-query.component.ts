import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { PickerComponent } from '../../picker/picker.component';
import { PickerImports, PickerProviders } from '../../picker/picker-providers.constant';
import { EntityQueryLogic } from './entity-query-logic';
import { StateAdapterEntity } from '../../picker/adapters/state-adapter-entity';
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';
import { DataAdapterQuery } from '../../picker/adapters/data-adapter-query';

const logThis = false;
const nameOfThis = 'EntityQueryComponent';

@Component({
  selector: InputTypeConstants.EntityQuery,
  templateUrl: '../../picker/picker.component.html',
  styleUrls: ['../../picker/picker.component.scss'],
  providers: PickerProviders,
  standalone: true,
  imports: PickerImports,
})
export class EntityQueryComponent extends PickerComponent implements OnInit, OnDestroy {

  private stateEntity = inject(StateAdapterEntity);
  protected querySourceAdapterRaw = inject(DataAdapterQuery);

  constructor() {
    super(new EavLogger(nameOfThis, logThis));
    this.log.a('constructor');
    EntityQueryLogic.importMe();
  }

  protected override createPickerAdapters(): void {
    this.log.a('createPickerAdapters');
    const state = this.stateEntity.attachToComponent(this);

    this.log.a('createPickerAdapters: PickerConfigModels.UiPickerSourceQuery');
    const source = this.querySourceAdapterRaw.linkLog(this.log).connectState(state, false);

    this.pickerData.setup(nameOfThis, state, source);
  }
}

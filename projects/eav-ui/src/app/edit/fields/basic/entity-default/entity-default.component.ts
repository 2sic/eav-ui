import { Component, OnDestroy, OnInit } from '@angular/core';
import { EntityDefaultLogic } from './entity-default-logic';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { DataAdapterEntity } from '../../picker/adapters/data-adapter-entity';
import { StateAdapterEntity } from '../../picker/adapters/state-adapter-entity';
import { PickerImports } from '../../picker/picker-providers.constant';
import { PickerComponent } from '../../picker/picker.component';
import { transient } from '../../../../core/transient';
import { EavLogger } from '../../../../shared/logging/eav-logger';

const logThis = false;
const nameOfThis = 'EntityDefaultComponent';

@Component({
  selector: InputTypeCatalog.EntityDefault,
  templateUrl: '../../picker/picker.component.html',
  styleUrls: ['../../picker/picker.component.scss'],
  standalone: true,
  imports: PickerImports,
})
export class EntityDefaultComponent extends PickerComponent implements OnInit, OnDestroy {
  private stateRaw = transient(StateAdapterEntity);

  constructor() {
    super(new EavLogger(nameOfThis, logThis));
    EntityDefaultLogic.importMe();
  }

  protected override createPickerAdapters(): void {
    this.log.a('createPickerAdapters');

    const state = this.stateRaw.linkLog(this.log).attachCallback(this.focusOnSearchComponent);

    const source = transient(DataAdapterEntity, this.injector).linkLog(this.log).connectState(state, false);

    this.pickerData.setup(nameOfThis, state, source);
  }
}

import { Component, OnDestroy, OnInit } from '@angular/core';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { PickerComponent } from '../../picker/picker.component';
import { PickerImports } from '../../picker/picker-providers.constant';
import { EntityDefaultLogic } from './entity-default-logic';
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';
import { StateAdapterEntity } from '../../picker/adapters/state-adapter-entity';
import { DataAdapterEntity } from '../../picker/adapters/data-adapter-entity';
import { transient } from 'projects/eav-ui/src/app/core';

const logThis = false;
const nameOfThis = 'EntityDefaultComponent';

@Component({
  selector: InputTypeConstants.EntityDefault,
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

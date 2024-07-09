import { Component, OnDestroy, OnInit } from '@angular/core';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { PickerImports } from '../../picker/picker-providers.constant';
import { EntityContentBlocksLogic } from './entity-content-blocks-logic';
import { EntityDefaultComponent } from '../entity-default/entity-default.component';

const logThis = false;
const nameOfThis = 'EntityContentBlockComponent';

@Component({
  selector: InputTypeConstants.EntityContentBlocks,
  templateUrl: '../../picker/picker.component.html',
  styleUrls: ['../../picker/picker.component.scss'],
  standalone: true,
  imports: PickerImports,
})
export class EntityContentBlockComponent extends EntityDefaultComponent implements OnInit, OnDestroy {

  // private stateRaw = transient(StateAdapterEntity);

  constructor() {
    super();//new EavLogger(nameOfThis, logThis));
    EntityContentBlocksLogic.importMe();
  }

  // protected override createPickerAdapters(): void {
  //   this.log.a('createPickerAdapters');
  //   const state = this.stateRaw.linkLog(this.log).attachCallback(this.focusOnSearchComponent);

  //   const source = transient(DataAdapterEntity, this.injector).linkLog(this.log).connectState(state, false);

  //   this.pickerData.setup(nameOfThis, state, source);
  // }
}

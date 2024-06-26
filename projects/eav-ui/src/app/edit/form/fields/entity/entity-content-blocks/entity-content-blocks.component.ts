import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { PickerComponent } from '../../picker/picker.component';
import { PickerImports, PickerProviders } from '../../picker/picker-providers.constant';
import { EntityContentBlocksLogic } from './entity-content-blocks-logic';
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';
import { StateAdapter } from '../../picker/adapters/state-adapter';
import { DataAdapterEntity } from '../../picker/adapters/data-adapter-entity';

const logThis = false;
const nameOfThis = 'EntityContentBlockComponent';

@Component({
  selector: InputTypeConstants.EntityContentBlocks,
  templateUrl: '../../picker/picker.component.html',
  styleUrls: ['../../picker/picker.component.scss'],
  providers: PickerProviders,
  standalone: true,
  imports: PickerImports,
})
export class EntityContentBlockComponent extends PickerComponent implements OnInit, OnDestroy {

  private stateRaw = inject(StateAdapter);
  private entitySourceAdapter = inject(DataAdapterEntity);

  constructor() {
    super(new EavLogger(nameOfThis, logThis));
    EntityContentBlocksLogic.importMe();
  }

  protected override createPickerAdapters(): void {
    this.log.a('createPickerAdapters');
    const state = this.stateRaw.linkLog(this.log).attachCallback(this.focusOnSearchComponent);

    const source = this.entitySourceAdapter.linkLog(this.log).connectState(state, false);

    this.pickerData.setup(nameOfThis, state, source);
  }
}

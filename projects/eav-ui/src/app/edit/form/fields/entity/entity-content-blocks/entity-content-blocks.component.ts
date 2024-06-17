import { Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { PickerComponent } from '../../picker/picker.component';
import { PickerProviders } from '../../picker/picker-providers.constant';
import { EntityContentBlocksLogic } from './entity-content-blocks-logic';
import { PickerData } from '../../picker/picker-data';
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';
import { StateAdapter } from '../../picker/adapters/state-adapter';
import { DataAdapterEntity } from '../../picker/adapters/data-adapter-entity';
import { AsyncPipe } from '@angular/common';
import { PickerDialogComponent } from '../../picker/picker-dialog/picker-dialog.component';
import { PickerPreviewComponent } from '../../picker/picker-preview/picker-preview.component';

const logThis = false;
const nameOfThis = 'EntityContentBlockComponent';

@Component({
  selector: InputTypeConstants.EntityContentBlocks,
  templateUrl: '../../picker/picker.component.html',
  styleUrls: ['../../picker/picker.component.scss'],
  providers: PickerProviders,
  standalone: true,
  imports: [
    PickerPreviewComponent,
    PickerDialogComponent,
    AsyncPipe,
  ],
})
export class EntityContentBlockComponent extends PickerComponent implements OnInit, OnDestroy {

  constructor(
    private translate: TranslateService,
    private pickerStateAdapterRaw: StateAdapter,
    private pickerEntitySourceAdapter: DataAdapterEntity,
    private injector: Injector,
  ) {
    super();
    this.log = new EavLogger(nameOfThis, logThis);
    this.log.a('constructor');
    EntityContentBlocksLogic.importMe();
  }

  protected override createPickerAdapters(): void {
    this.log.a('createPickerAdapters');
    const state = this.pickerStateAdapterRaw.attachToComponent(this);

    const source = this.pickerEntitySourceAdapter.setupFromComponent(this, state, false);

    state.init(nameOfThis);
    source.init(nameOfThis);
    this.pickerData = new PickerData(
      state,
      source,
      this.translate,
      this.injector,
    );
  }
}

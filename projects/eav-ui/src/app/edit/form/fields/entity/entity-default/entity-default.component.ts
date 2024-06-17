import { Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { EditRoutingService, FieldsSettingsService } from '../../../../shared/services';
import { PickerComponent } from '../../picker/picker.component';
import { PickerProviders } from '../../picker/picker-providers.constant';
import { EntityDefaultLogic } from './entity-default-logic';
import { PickerData } from '../../picker/picker-data';
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';
import { StateAdapterEntity } from '../../picker/adapters/state-adapter-entity';
import { DataAdapterEntity } from '../../picker/adapters/data-adapter-entity';
import { AsyncPipe } from '@angular/common';
import { PickerDialogComponent } from '../../picker/picker-dialog/picker-dialog.component';
import { PickerPreviewComponent } from '../../picker/picker-preview/picker-preview.component';

const logThis = false;

@Component({
  selector: InputTypeConstants.EntityDefault,
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
export class EntityDefaultComponent extends PickerComponent implements OnInit, OnDestroy {
  constructor(
    fieldsSettingsService: FieldsSettingsService,
    private translate: TranslateService,
    editRoutingService: EditRoutingService,
    private stateRaw: StateAdapterEntity,
    private pickerEntitySourceAdapter: DataAdapterEntity,
    private injector: Injector,
  ) {
    super(
      fieldsSettingsService,
      editRoutingService,
    );
    this.log = new EavLogger('EntityDefaultComponent', logThis);
    this.log.a('constructor');
    EntityDefaultLogic.importMe();
  }

  protected override createPickerAdapters(): void {
    this.log.a('createPickerAdapters');

    const state = this.stateRaw.attachToComponent(this);

    this.log.a('specs', ['isStringQuery', this.isStringQuery, 'state', state, 'control', this.control, 'config', this.config, 'settings$', this.settings$])

    const source = this.pickerEntitySourceAdapter.setupFromComponent(this, state, false);

    state.init('EntityDefaultComponent');
    source.init('EntityDefaultComponent');
    this.pickerData = new PickerData(
      state,
      source,
      this.translate,
      this.injector,
    );

  }
}

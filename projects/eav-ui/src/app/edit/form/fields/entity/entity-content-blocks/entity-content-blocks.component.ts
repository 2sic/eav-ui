import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { EditRoutingService, FieldsSettingsService } from '../../../../shared/services';
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
import { FieldMetadata } from '../../../builder/fields-builder/field-metadata.decorator';

const logThis = false;

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
@FieldMetadata({ /* This is needed for the field to work */ })
export class EntityContentBlockComponent extends PickerComponent implements OnInit, OnDestroy {

  constructor(
    fieldsSettingsService: FieldsSettingsService,
    private translate: TranslateService,
    editRoutingService: EditRoutingService,
    private pickerStateAdapterRaw: StateAdapter,
    private pickerEntitySourceAdapter: DataAdapterEntity,
  ) {
    super(
      fieldsSettingsService,
      editRoutingService,
    );
    this.log = new EavLogger('EntityContentBlockComponent', logThis);
    this.log.a('constructor');
    EntityContentBlocksLogic.importMe();
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.initAdaptersAndViewModel();
  }

  protected /* FYI: override */ createPickerAdapters(): void {
    this.log.a('createPickerAdapters');
    const state = this.pickerStateAdapterRaw.attachToComponent(this);

    const source = this.pickerEntitySourceAdapter.setupFromComponent(this, state);

    state.init('EntityContentBlockComponent');
    source.init('EntityContentBlockComponent');
    this.pickerData = new PickerData(
      state,
      source,
      this.translate,
    );
  }
}

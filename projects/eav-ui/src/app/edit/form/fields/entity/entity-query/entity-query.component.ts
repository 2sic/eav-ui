import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { EditRoutingService, FieldsSettingsService } from '../../../../shared/services';
import { PickerComponent, PickerProviders } from '../../picker/picker.component';
import { EntityQueryLogic } from './entity-query-logic';
import { PickerData } from '../../picker/picker-data';
import { PickerEntityStateAdapter } from '../../picker/adapters/picker-entity-state-adapter';
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';
import { PickerQuerySourceAdapter } from '../../picker/adapters/picker-query-source-adapter';
import { AsyncPipe } from '@angular/common';
import { PickerDialogComponent } from '../../picker/picker-dialog/picker-dialog.component';
import { PickerPreviewComponent } from '../../picker/picker-preview/picker-preview.component';

const logThis = false;

@Component({
  selector: InputTypeConstants.EntityQuery,
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
export class EntityQueryComponent extends PickerComponent implements OnInit, OnDestroy {

  constructor(
    fieldsSettingsService: FieldsSettingsService,
    protected translate: TranslateService,
    editRoutingService: EditRoutingService,
    private stateRaw: PickerEntityStateAdapter,
    protected querySourceAdapterRaw: PickerQuerySourceAdapter,
  ) {
    super(
      fieldsSettingsService,
      editRoutingService,
    );
    this.log = new EavLogger('EntityQueryComponent', logThis);
    this.log.a('constructor');
    EntityQueryLogic.importMe();
    this.isStringQuery = false;
  }

  ngOnInit(): void {
    super.ngOnInit();
    // always do this
    this.initAdaptersAndViewModel();
  }

  protected /* FYI: override */ createPickerAdapters(): void {
    this.log.a('createPickerAdapters');
    const state = this.stateRaw.attachToComponent(this);

    this.log.a('createPickerAdapters: PickerConfigModels.UiPickerSourceQuery');
    this.log.a('specs', ['isStringQuery', this.isStringQuery, 'state', state, 'control', this.control, 'config', this.config, 'settings$', this.settings$]);
    const source = this.querySourceAdapterRaw.setupFromComponent(this, state)
      .setupQuery(state.error$);

    state.init('EntityQueryComponent');
    source.init('EntityQueryComponent');
    this.pickerData = new PickerData(
      state,
      source,
      this.translate,
    );
  }
}

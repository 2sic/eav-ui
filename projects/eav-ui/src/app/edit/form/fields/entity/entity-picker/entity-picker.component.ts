import { Component, OnDestroy, OnInit } from '@angular/core';
import { InputTypeConstants } from 'projects/eav-ui/src/app/content-type-fields/constants/input-type.constants';
import { PickerComponent } from '../../picker/picker.component';
import { PickerProviders } from '../../picker/picker-providers.constant';
import { TranslateService } from '@ngx-translate/core';
import { FieldsSettingsService, EditRoutingService } from '../../../../shared/services';
import { EntityPickerLogic } from './entity-picker-logic';
import { PickerData } from '../../picker/picker-data';
import { DataAdapterQuery } from '../../picker/adapters/data-adapter-query';
import { DataAdapterEntity } from '../../picker/adapters/data-adapter-entity';
import { PickerConfigModels } from '../../picker/constants/picker-config-model.constants';
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';
import { StateAdapterEntity } from '../../picker/adapters/state-adapter-entity';
import { AsyncPipe } from '@angular/common';
import { PickerDialogComponent } from '../../picker/picker-dialog/picker-dialog.component';
import { PickerPreviewComponent } from '../../picker/picker-preview/picker-preview.component';

const logThis = true;

@Component({
  selector: InputTypeConstants.EntityPicker,
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
export class EntityPickerComponent extends PickerComponent implements OnInit, OnDestroy {
  constructor(
    fieldsSettingsService: FieldsSettingsService,
    private translate: TranslateService,
    editRoutingService: EditRoutingService,
    private stateRaw: StateAdapterEntity,
    private entitySourceAdapterRaw: DataAdapterEntity,
    private querySourceAdapterRaw: DataAdapterQuery,
  ) {
    super(
      fieldsSettingsService,
      editRoutingService,
    );
    this.log = new EavLogger('EntityPickerComponent', logThis);
    this.log.a('constructor');
    EntityPickerLogic.importMe();
    this.isStringQuery = false;
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.initAdaptersAndViewModel();
  }

  protected /* FYI: override */ createPickerAdapters(): void {
    this.log.a('createPickerAdapters');
    let source: DataAdapterQuery | DataAdapterEntity;

    const state = this.stateRaw.attachToComponent(this);

    const dataSourceType = this.settings$.value.DataSourceType;
    this.log.a(`createPickerAdapters: dataSourceType: '${dataSourceType}'`);

    if (dataSourceType === PickerConfigModels.UiPickerSourceEntity) {
      this.log.a('createPickerAdapters: PickerConfigModels.UiPickerSourceEntity');
      source = this.entitySourceAdapterRaw.setupFromComponent(this, state);
    } else if (dataSourceType === PickerConfigModels.UiPickerSourceQuery) {
      this.log.a('createPickerAdapters: PickerConfigModels.UiPickerSourceQuery');
      this.log.a('specs', ['isStringQuery', this.isStringQuery, 'state', state, 'control', this.control, 'config', this.config, 'settings$', this.settings$])
      source = this.querySourceAdapterRaw.setupFromComponent(this, state).setupQuery(state.error$);
    }

    state.init('EntityPickerComponent');
    source.init('EntityPickerComponent');
    this.pickerData = new PickerData(
      state,
      source,
      this.translate,
    );
  }
}

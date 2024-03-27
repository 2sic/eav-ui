import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { EavService, EditRoutingService, EntityService, FieldsSettingsService } from '../../../../shared/services';
import { EntityCacheService, StringQueryCacheService } from '../../../../shared/store/ngrx-data';
import { FieldMetadata } from '../../../builder/fields-builder/field-metadata.decorator';
import { PickerComponent, pickerProviders } from '../../picker/picker.component';
import { EntityQueryLogic } from './entity-query-logic';
import { PickerData } from '../../picker/picker-data';
import { PickerEntityStateAdapter } from '../../picker/adapters/picker-entity-state-adapter';
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';
import { PickerQuerySourceAdapter } from '../../picker/adapters/picker-query-source-adapter';

const logThis = true;

@Component({
  selector: InputTypeConstants.EntityQuery,
  templateUrl: '../../picker/picker.component.html',
  styleUrls: ['../../picker/picker.component.scss'],
  providers: pickerProviders,
})
@FieldMetadata({})
export class EntityQueryComponent extends PickerComponent implements OnInit, OnDestroy {

  constructor(
    eavService: EavService,
    fieldsSettingsService: FieldsSettingsService,
    entityService: EntityService,
    translate: TranslateService,
    editRoutingService: EditRoutingService,
    entityCacheService: EntityCacheService,
    stringQueryCacheService: StringQueryCacheService,
    private stateRaw: PickerEntityStateAdapter,
    protected querySourceAdapterRaw: PickerQuerySourceAdapter,
  ) {
    super(
      eavService,
      fieldsSettingsService,
      entityService,
      translate,
      editRoutingService,
      entityCacheService,
      stringQueryCacheService,
    );
    this.log = new EavLogger('EntityQueryComponent', logThis);
    this.log.add('constructor');
    EntityQueryLogic.importMe();
    this.isStringQuery = false;
  }

  ngOnInit(): void {
    super.ngOnInit();
    // always do this
    this.initAdaptersAndViewModel();
  }

  protected /* FYI: override */ createPickerAdapters(): void {
    this.log.add('createPickerAdapters');
    const state = this.stateRaw.setupFromComponent(this);

    this.log.add('createPickerAdapters: PickerConfigModels.UiPickerSourceQuery');
    this.log.add('specs', 'isStringQuery', this.isStringQuery, 'state', state, 'control', this.control, 'config', this.config, 'settings$', this.settings$)
    const source = this.querySourceAdapterRaw.setupFromComponent(this, state)
      .setupQuery(state.error$);

    state.init();
    source.init('EntityQueryComponent.createPickerAdapters');
    this.pickerData = new PickerData(
      state,
      source,
      this.translate,
    );
  }
}

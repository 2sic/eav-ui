import { Component, OnDestroy, OnInit } from '@angular/core';
import { InputTypeConstants } from 'projects/eav-ui/src/app/content-type-fields/constants/input-type.constants';
import { PickerComponent, pickerProviders } from '../../picker/picker.component';
import { TranslateService } from '@ngx-translate/core';
import { EavService, FieldsSettingsService, EntityService, EditRoutingService } from '../../../../shared/services';
import { EntityCacheService, StringQueryCacheService } from '../../../../shared/store/ngrx-data';
import { PickerSourceAdapterFactoryService } from '../../picker/factories/picker-source-adapter-factory.service';
import { PickerStateAdapterFactoryService } from '../../picker/factories/picker-state-adapter-factory.service';
import { DeleteEntityProps } from '../../picker/picker.models';
import { EntityPickerLogic } from './entity-picker-logic';
import { FieldMetadata } from '../../../builder/fields-builder/field-metadata.decorator';
import { PickerData } from '../../picker/picker-data';
import { PickerQuerySourceAdapter } from '../../picker/adapters/picker-query-source-adapter';
import { PickerEntitySourceAdapter } from '../../picker/adapters/picker-entity-source-adapter';
import { PickerConfigModels } from '../../picker/constants/picker-config-model.constants';
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';
import { PickerEntityStateAdapter } from '../../picker/adapters/picker-entity-state-adapter';

const logThis = true;

@Component({
  selector: InputTypeConstants.WIPEntityPicker,
  templateUrl: '../../picker/picker.component.html',
  styleUrls: ['../../picker/picker.component.scss'],
  providers: pickerProviders,
})
@FieldMetadata({})
export class EntityPickerComponent extends PickerComponent implements OnInit, OnDestroy {
  constructor(
    eavService: EavService,
    fieldsSettingsService: FieldsSettingsService,
    entityService: EntityService,
    translate: TranslateService,
    editRoutingService: EditRoutingService,
    entityCacheService: EntityCacheService,
    stringQueryCacheService: StringQueryCacheService,
    private sourceFactory: PickerSourceAdapterFactoryService,
    // private stateFactory: PickerStateAdapterFactoryService,
    private stateRaw: PickerEntityStateAdapter,
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
    this.log = new EavLogger('EntityPickerComponent', logThis);
    this.log.add('constructor');
    EntityPickerLogic.importMe();
    this.isStringQuery = false;
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.initAdaptersAndViewModel();
  }

  protected /* FYI: override */ createPickerAdapters(): void {
    this.log.add('createPickerAdapters');
    let source: PickerQuerySourceAdapter | PickerEntitySourceAdapter;

    // const state = this.stateFactory.createPickerEntityStateAdapter(this);
    const state = this.stateRaw.setupFromComponent(this);

    const dataSourceType = this.settings$.value.DataSourceType;
    this.log.add('createPickerAdapters: dataSourceType', dataSourceType);

    if (dataSourceType === PickerConfigModels.UiPickerSourceEntity) {
      this.log.add('createPickerAdapters: PickerConfigModels.UiPickerSourceEntity');
      source = this.sourceFactory.createPickerEntitySourceAdapter(
        state.disableAddNew$,
        state.control,
        this.config,
        state.settings$,
        this.group,
        // (clearAvailableItemsAndOnlyUpdateCache: boolean) => this.fetchEntities(clearAvailableItemsAndOnlyUpdateCache),
        (props: DeleteEntityProps) => state.doAfterDelete(props)
      );
    } else if (dataSourceType === PickerConfigModels.UiPickerSourceQuery) {
      this.log.add('createPickerAdapters: PickerConfigModels.UiPickerSourceQuery');
      this.log.add('specs', 'isStringQuery', this.isStringQuery, 'state', state, 'control', this.control, 'config', this.config, 'settings$', this.settings$)
      source = this.sourceFactory.createPickerQuerySourceAdapter(
        state.error$,
        state.disableAddNew$,
        this.isStringQuery,
        state.control,
        this.config,
        state.settings$,
        this.group,
        // (clearAvailableItemsAndOnlyUpdateCache: boolean) => this.fetchEntities(clearAvailableItemsAndOnlyUpdateCache),
        (props: DeleteEntityProps) => state.doAfterDelete(props)
      );
    }

    state.init();
    source.init('EntityPickerComponent.createPickerAdapters');
    this.pickerData = new PickerData(
      state,
      source,
      this.translate,
    );
  }
}

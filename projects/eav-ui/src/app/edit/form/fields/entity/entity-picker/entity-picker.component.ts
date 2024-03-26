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

const logThis = false;

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
    private stateFactory: PickerStateAdapterFactoryService,
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
    EntityPickerLogic.importMe();
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.initAdaptersAndViewModel();
  }

  ngAfterViewInit(): void {
    super.ngAfterViewInit();
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  protected /* FYI: override */ createPickerAdapters(): void {
    this.log.add('createPickerAdapters');
    let source: PickerQuerySourceAdapter | PickerEntitySourceAdapter;

    const state = this.stateFactory.createPickerEntityStateAdapter(this);

    if (this.settings$.value.DataSourceType === PickerConfigModels.UiPickerSourceEntity) {
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
    } else if (this.settings$.value.DataSourceType === PickerConfigModels.UiPickerSourceQuery) {
      this.log.add('createPickerAdapters: PickerConfigModels.UiPickerSourceQuery');
      source = this.sourceFactory.createPickerQuerySourceAdapter(
        state.error$,
        state.disableAddNew$,
        false,
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

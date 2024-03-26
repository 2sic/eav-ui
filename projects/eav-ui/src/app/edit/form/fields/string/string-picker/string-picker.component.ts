import { Component, OnDestroy, OnInit } from '@angular/core';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { EavService, EditRoutingService, EntityService, FieldsSettingsService } from '../../../../shared/services';
import { FieldMetadata } from '../../../builder/fields-builder/field-metadata.decorator';
import { PickerComponent, pickerProviders } from '../../picker/picker.component';
import { TranslateService } from '@ngx-translate/core';
import { EntityCacheService, StringQueryCacheService } from '../../../../shared/store/ngrx-data';
import { DeleteEntityProps } from '../../picker/picker.models';
import { PickerData } from '../../picker/picker-data';
import { PickerSourceAdapterFactoryService } from '../../picker/factories/picker-source-adapter-factory.service';
import { PickerStateAdapterFactoryService } from '../../picker/factories/picker-state-adapter-factory.service';
import { StringPickerLogic } from './string-picker-logic';
import { PickerStringSourceAdapter } from '../../picker/adapters/picker-string-source-adapter';
import { PickerQuerySourceAdapter } from '../../picker/adapters/picker-query-source-adapter';
import { PickerEntitySourceAdapter } from '../../picker/adapters/picker-entity-source-adapter';
import { PickerConfigModels } from '../../picker/constants/picker-config-model.constants';
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';

const logThis = false;

@Component({
  selector: InputTypeConstants.WIPStringPicker,
  templateUrl: '../../picker/picker.component.html',
  styleUrls: ['../../picker/picker.component.scss'],
  providers: pickerProviders,
})
@FieldMetadata({
  // wrappers: [WrappersConstants.LocalizationWrapper],
})
export class StringPickerComponent extends PickerComponent implements OnInit, OnDestroy {
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
    private pickerStringSourceAdapterRaw: PickerStringSourceAdapter,
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
    this.log = new EavLogger('StringPickerComponent', logThis);
    StringPickerLogic.importMe();
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
    let source: PickerStringSourceAdapter | PickerQuerySourceAdapter | PickerEntitySourceAdapter;

    const state = this.stateFactory.createPickerStringStateAdapter(
      this.control,
      this.config,
      this.settings$,
      this.editRoutingService,
      this.controlStatus$,
      this.label$,
      this.placeholder$,
      this.required$,
      () => this.focusOnSearchComponent,
    );

    var dataSourceType = this.settings$.value.DataSourceType;

    if (dataSourceType === PickerConfigModels.UiPickerSourceCustomList) {
      source = this.pickerStringSourceAdapterRaw.setupString(
        state.settings$,
        state.disableAddNew$,
        this.config,
        this.group,
        (props: DeleteEntityProps) => state.doAfterDelete(props)
      );
    } else if (dataSourceType === PickerConfigModels.UiPickerSourceQuery) {
      source = this.sourceFactory.createPickerQuerySourceAdapter(
        state.error$,
        state.disableAddNew$,
        true,

        state.control,
        this.config,
        state.settings$,
        this.group,
        // (clearAvailableItemsAndOnlyUpdateCache: boolean) => this.fetchEntities(clearAvailableItemsAndOnlyUpdateCache),
        (props: DeleteEntityProps) => state.doAfterDelete(props)
      );
    } else if (dataSourceType === PickerConfigModels.UiPickerSourceEntity) { 
      source = this.sourceFactory.createPickerEntitySourceAdapter(
        state.disableAddNew$,
        state.control,
        this.config,
        state.settings$,
        this.group,
        // (clearAvailableItemsAndOnlyUpdateCache: boolean) => this.fetchEntities(clearAvailableItemsAndOnlyUpdateCache),
        (props: DeleteEntityProps) => state.doAfterDelete(props)
      );
    }
    
    state.init();
    source.init('StringPickerComponent.createPickerAdapters');
    this.pickerData = new PickerData(
      state,
      source,
      this.translate,
    );
  }
}

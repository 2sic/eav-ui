import { Component, OnDestroy, OnInit } from '@angular/core';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { EavService, EditRoutingService, EntityService, FieldsSettingsService } from '../../../../shared/services';
import { FieldMetadata } from '../../../builder/fields-builder/field-metadata.decorator';
import { PickerComponent } from '../../picker/picker.component';
import { TranslateService } from '@ngx-translate/core';
import { EntityCacheService, StringQueryCacheService } from '../../../../shared/store/ngrx-data';
import { EntityDefaultLogic } from '../../entity/entity-default/entity-default-logic';
import { PickerSourceAdapterFactoryService } from '../../picker/factories/picker-source-adapter-factory.service';
import { PickerStateAdapterFactoryService } from '../../picker/factories/picker-state-adapter-factory.service';
import { DeleteEntityProps } from '../../picker/picker.models';
import { PickerData } from '../../picker/picker-data';

@Component({
  selector: InputTypeConstants.StringDropdown,
  templateUrl: '../../picker/picker.component.html',
  styleUrls: ['../../picker/picker.component.scss'],
})
@FieldMetadata({
  // wrappers: [WrappersConstants.LocalizationWrapper],
})
export class StringDropdownComponent extends PickerComponent implements OnInit, OnDestroy {
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
    EntityDefaultLogic.importMe();
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.createPickerAdapters();
    this.createViewModel();
  }

  ngAfterViewInit(): void {
    super.ngAfterViewInit();
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  private createPickerAdapters(): void {
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

    const source = this.sourceFactory.createPickerStringSourceAdapter(
      state.disableAddNew$,
      this.fieldsSettingsService,

      state.control,
      this.config,
      state.settings$,
      this.editRoutingService,
      this.group,
      // (clearAvailableItemsAndOnlyUpdateCache: boolean) => this.fetchEntities(clearAvailableItemsAndOnlyUpdateCache),
      (props: DeleteEntityProps) => state.doAfterDelete(props)
    );

    state.init();
    source.init();
    this.pickerData = new PickerData(
      state,
      source,
      this.translate,
    );
  }
}

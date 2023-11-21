import { Component, OnDestroy, OnInit } from '@angular/core';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { EavService, EditRoutingService, EntityService, FieldsSettingsService } from '../../../../shared/services';
import { FieldMetadata } from '../../../builder/fields-builder/field-metadata.decorator';
import { PickerComponent } from '../../picker/picker.component';
import { TranslateService } from '@ngx-translate/core';
import { EntityCacheService, StringQueryCacheService } from '../../../../shared/store/ngrx-data';
import { EntityDefaultLogic } from '../../entity/entity-default/entity-default-logic';
import { PickerEntitySourceAdapter } from '../../picker/picker-entity-source-adapter';
import { PickerSourceAdapterFactoryService } from '../../picker/picker-source-adapter-factory.service';
import { PickerStateAdapterFactoryService } from '../../picker/picker-state-adapter-factory.service';
import { DeleteEntityProps } from '../../picker/picker.models';
import { PickerStringStateAdapter } from '../../picker/picker-string-state-adapter';
import { PickerStringSourceAdapter } from '../../picker/picker-string-source-adapter';

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
    private pickerSourceAdapterFactoryService: PickerSourceAdapterFactoryService,
    private pickerStateAdapterFactoryService: PickerStateAdapterFactoryService,
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

    this.createTemplateVariables();
  }

  ngAfterViewInit(): void {
    super.ngAfterViewInit();
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  private createPickerAdapters(): void {
    this.pickerStateAdapter = this.pickerStateAdapterFactoryService.createPickerStringStateAdapter(
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

    this.pickerSourceAdapter = this.pickerSourceAdapterFactoryService.createPickerStringSourceAdapter(
      this.pickerStateAdapter.disableAddNew$,
      this.fieldsSettingsService,

      this.pickerStateAdapter.control,
      this.config,
      this.pickerStateAdapter.settings$,
      this.editRoutingService,
      this.group,
      // (clearAvailableItemsAndOnlyUpdateCache: boolean) => this.fetchEntities(clearAvailableItemsAndOnlyUpdateCache),
      (props: DeleteEntityProps) => this.pickerStateAdapter.doAfterDelete(props)
    );

    this.pickerStateAdapterFactoryService.initString(this.pickerStateAdapter as PickerStringStateAdapter);
    this.pickerSourceAdapterFactoryService.initString(this.pickerSourceAdapter as PickerStringSourceAdapter);
  }
}

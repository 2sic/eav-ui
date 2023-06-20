import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { EavService, EditRoutingService, EntityService, FieldsSettingsService, QueryService } from '../../../../shared/services';
import { EntityCacheService, StringQueryCacheService } from '../../../../shared/store/ngrx-data';
import { FieldMetadata } from '../../../builder/fields-builder/field-metadata.decorator';
import { PickerSourceAdapterFactoryService } from '../../picker/picker-source-adapter-factory.service';
import { PickerStateAdapterFactoryService } from '../../picker/picker-state-adapter-factory.service';
import { PickerComponent } from '../../picker/picker.component';
import { EntityQueryLogic } from './entity-query-logic';
import { DeleteEntityProps } from '../../picker/picker.models';
import { PickerQuerySourceAdapter } from '../../picker/picker-query-source-adapter';
import { PickerEntityStateAdapter } from '../../picker/picker-entity-state-adapter';

@Component({
  selector: InputTypeConstants.EntityQuery,
  templateUrl: '../../picker/picker.component.html',
  styleUrls: ['../../picker/picker.component.scss'],
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
    protected pickerSourceAdapterFactoryService: PickerSourceAdapterFactoryService,
    protected pickerStateAdapterFactoryService: PickerStateAdapterFactoryService,
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
    EntityQueryLogic.importMe();
    this.isStringQuery = false;
  }

  ngOnInit(): void {
    super.ngOnInit();
    if (!this.isStringQuery) {
      this.createPickerAdapters();
      this.createTemplateVariables();
    }
  }

  ngAfterViewInit(): void {
    super.ngAfterViewInit();
  }


  ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  protected createPickerAdapters(): void {
    this.pickerStateAdapter = this.pickerStateAdapterFactoryService.createPickerEntityStateAdapter(
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

    this.pickerSourceAdapter = this.pickerSourceAdapterFactoryService.createPickerQuerySourceAdapter(
      this.pickerStateAdapter.error$,
      this.fieldsSettingsService,
      this.isStringQuery,

      this.pickerStateAdapter.control,
      this.config,
      this.pickerStateAdapter.settings$,
      this.editRoutingService,
      this.group,
      // (clearAvailableEntitiesAndOnlyUpdateCache: boolean) => this.fetchEntities(clearAvailableEntitiesAndOnlyUpdateCache),
      (props: DeleteEntityProps) => this.pickerStateAdapter.doAfterDelete(props)
    );

    this.pickerStateAdapterFactoryService.initEntity(this.pickerStateAdapter as PickerEntityStateAdapter);
    this.pickerSourceAdapterFactoryService.initQuery(this.pickerSourceAdapter as PickerQuerySourceAdapter);
  }
}

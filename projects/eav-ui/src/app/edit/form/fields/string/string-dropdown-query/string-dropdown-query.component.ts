import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { EavService, EditRoutingService, EntityService, FieldsSettingsService } from '../../../../shared/services';
import { EntityCacheService, StringQueryCacheService } from '../../../../shared/store/ngrx-data';
import { FieldMetadata } from '../../../builder/fields-builder/field-metadata.decorator';
import { EntityQueryComponent } from '../../entity/entity-query/entity-query.component';
import { PickerSourceAdapterFactoryService } from '../../picker/factories/picker-source-adapter-factory.service';
import { StringDropdownQueryLogic } from './string-dropdown-query-logic';
import { DeleteEntityProps } from '../../picker/picker.models';
import { PickerData } from '../../picker/picker-data';
import { pickerProviders } from '../../picker/picker.component';
import { PickerEntityStateAdapter } from '../../picker/adapters/picker-entity-state-adapter';
import { PickerStringStateAdapter } from '../../picker/adapters/picker-string-state-adapter';

@Component({
  selector: InputTypeConstants.StringDropdownQuery,
  templateUrl: '../../picker/picker.component.html',
  styleUrls: ['../../picker/picker.component.scss'],
  providers: pickerProviders,
})
@FieldMetadata({})
export class StringDropdownQueryComponent extends EntityQueryComponent implements OnInit, OnDestroy {

  constructor(
    eavService: EavService,
    fieldsSettingsService: FieldsSettingsService,
    entityService: EntityService,
    translate: TranslateService,
    editRoutingService: EditRoutingService,
    entityCacheService: EntityCacheService,
    stringQueryCacheService: StringQueryCacheService,
    sourceFactory: PickerSourceAdapterFactoryService,
    stateRaw: PickerEntityStateAdapter,
    private pickerStringStateAdapterRaw: PickerStringStateAdapter,
  ) {
    super(
      eavService,
      fieldsSettingsService,
      entityService,
      translate,
      editRoutingService,
      entityCacheService,
      stringQueryCacheService,
      sourceFactory,
      // stateFactory,
      stateRaw,
    );
    StringDropdownQueryLogic.importMe();
    this.isStringQuery = true;
  }

  ngOnInit(): void {
    super.ngOnInit();
    // already done by base...
    // if (this.isStringQuery)
    // this.initAdaptersAndViewModel();
  }


  protected /* FYI: override */ createPickerAdapters(): void {
    this.log.add('createPickerAdapters');
    const state = this.pickerStringStateAdapterRaw.setupFromComponent(this);

    const source = this.sourceFactory.createPickerQuerySourceAdapter(
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

    state.init();
    source.init('StringDropdownQueryComponent.createPickerAdapters');
    this.pickerData = new PickerData(
      state,
      source,
      this.translate,
    );
  }
}

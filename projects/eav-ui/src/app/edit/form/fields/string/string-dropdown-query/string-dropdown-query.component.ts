import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { EavService, EditRoutingService, EntityService, FieldsSettingsService } from '../../../../shared/services';
import { EntityCacheService, StringQueryCacheService } from '../../../../shared/store/ngrx-data';
import { FieldMetadata } from '../../../builder/fields-builder/field-metadata.decorator';
import { EntityQueryComponent } from '../../entity/entity-query/entity-query.component';
import { StringDropdownQueryLogic } from './string-dropdown-query-logic';
import { PickerData } from '../../picker/picker-data';
import { pickerProviders } from '../../picker/picker.component';
import { PickerEntityStateAdapter } from '../../picker/adapters/picker-entity-state-adapter';
import { PickerStringStateAdapter } from '../../picker/adapters/picker-string-state-adapter';
import { PickerQuerySourceAdapter } from '../../picker/adapters/picker-query-source-adapter';

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
    stateRaw: PickerEntityStateAdapter,
    private pickerStringStateAdapterRaw: PickerStringStateAdapter,
    querySourceAdapterRaw: PickerQuerySourceAdapter,
  ) {
    super(
      eavService,
      fieldsSettingsService,
      entityService,
      translate,
      editRoutingService,
      entityCacheService,
      stringQueryCacheService,
      stateRaw,
      querySourceAdapterRaw,
    );
    StringDropdownQueryLogic.importMe();
    this.isStringQuery = true;
  }


  protected /* FYI: override */ createPickerAdapters(): void {
    this.log.add('createPickerAdapters');
    const state = this.pickerStringStateAdapterRaw.setupFromComponent(this);

    const source = this.querySourceAdapterRaw.setupFromComponent(this, state)
      .setupQuery(state.error$);

    state.init();
    source.init('StringDropdownQueryComponent.createPickerAdapters');
    this.pickerData = new PickerData(
      state,
      source,
      this.translate,
    );
  }
}

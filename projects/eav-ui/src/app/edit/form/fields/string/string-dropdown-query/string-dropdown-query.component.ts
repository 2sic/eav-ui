import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { EavService, EditRoutingService, EntityService, FieldsSettingsService } from '../../../../shared/services';
import { EntityCacheService, StringQueryCacheService } from '../../../../shared/store/ngrx-data';
import { FieldMetadata } from '../../../builder/fields-builder/field-metadata.decorator';
import { EntityQueryComponent } from '../../entity/entity-query/entity-query.component';
import { PickerSourceAdapterFactoryService } from '../../picker/factories/picker-source-adapter-factory.service';
import { PickerStateAdapterFactoryService } from '../../picker/factories/picker-state-adapter-factory.service';
import { StringDropdownQueryLogic } from './string-dropdown-query-logic';
import { DeleteEntityProps } from '../../picker/picker.models';
import { PickerData } from '../../picker/picker-data';

@Component({
  selector: InputTypeConstants.StringDropdownQuery,
  templateUrl: '../../picker/picker.component.html',
  styleUrls: ['../../picker/picker.component.scss'],
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
    stateFactory: PickerStateAdapterFactoryService,
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
      stateFactory
    );
    StringDropdownQueryLogic.importMe();
    this.isStringQuery = true;
  }

  ngOnInit(): void {
    super.ngOnInit();
    if (this.isStringQuery) {
      this.createPickerAdapters();
      this.createViewModel();
    }
  }

  ngAfterViewInit(): void {
    super.ngAfterViewInit();
  }


  ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  protected createPickerAdapters(): void {
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

    const source = this.sourceFactory.createPickerQuerySourceAdapter(
      state.error$,
      this.fieldsSettingsService,
      this.isStringQuery,

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

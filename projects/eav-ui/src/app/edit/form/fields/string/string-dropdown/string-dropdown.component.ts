import { Component, OnDestroy, OnInit } from '@angular/core';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { EavService, EditRoutingService, EntityService, FieldsSettingsService } from '../../../../shared/services';
import { FieldMetadata } from '../../../builder/fields-builder/field-metadata.decorator';
import { PickerComponent, pickerProviders } from '../../picker/picker.component';
import { TranslateService } from '@ngx-translate/core';
import { EntityCacheService, StringQueryCacheService } from '../../../../shared/store/ngrx-data';
import { EntityDefaultLogic } from '../../entity/entity-default/entity-default-logic';
import { DeleteEntityProps } from '../../picker/picker.models';
import { PickerData } from '../../picker/picker-data';
import { PickerStringSourceAdapter } from '../../picker/adapters/picker-string-source-adapter';
import { PickerStringStateAdapter } from '../../picker/adapters/picker-string-state-adapter';

@Component({
  selector: InputTypeConstants.StringDropdown,
  templateUrl: '../../picker/picker.component.html',
  styleUrls: ['../../picker/picker.component.scss'],
  providers: pickerProviders,
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
    private pickerStringSourceAdapterRaw: PickerStringSourceAdapter,
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
    );
    EntityDefaultLogic.importMe();
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
    const state = this.pickerStringStateAdapterRaw.setupFromComponent(this);

    const source = this.pickerStringSourceAdapterRaw.setupString(
      state.settings$,
      state.disableAddNew$,
      this.config,
      this.group,
      (props: DeleteEntityProps) => state.doAfterDelete(props)
    );
;

    state.init();
    source.init('StringDropdownComponent.createPickerAdapters');
    this.pickerData = new PickerData(
      state,
      source,
      this.translate,
    );
  }
}

import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { EavService, EditRoutingService, FieldsSettingsService } from '../../../../shared/services';
import { FieldMetadata } from '../../../builder/fields-builder/field-metadata.decorator';
import { EntityQueryComponent } from '../../entity/entity-query/entity-query.component';
import { StringDropdownQueryLogic } from './string-dropdown-query-logic';
import { PickerData } from '../../picker/picker-data';
import { pickerProviders } from '../../picker/picker.component';
import { PickerEntityStateAdapter } from '../../picker/adapters/picker-entity-state-adapter';
import { PickerStringStateAdapter } from '../../picker/adapters/picker-string-state-adapter';
import { PickerQuerySourceAdapter } from '../../picker/adapters/picker-query-source-adapter';
import { AsyncPipe } from '@angular/common';
import { PickerDialogComponent } from '../../picker/picker-dialog/picker-dialog.component';
import { PickerPreviewComponent } from '../../picker/picker-preview/picker-preview.component';

@Component({
    selector: InputTypeConstants.StringDropdownQuery,
    templateUrl: '../../picker/picker.component.html',
    styleUrls: ['../../picker/picker.component.scss'],
    providers: pickerProviders,
    standalone: true,
    imports: [
        PickerPreviewComponent,
        PickerDialogComponent,
        AsyncPipe,
    ],
})
@FieldMetadata({})
export class StringDropdownQueryComponent extends EntityQueryComponent implements OnInit, OnDestroy {

  constructor(
    eavService: EavService,
    fieldsSettingsService: FieldsSettingsService,
    translate: TranslateService,
    editRoutingService: EditRoutingService,
    stateRaw: PickerEntityStateAdapter,
    private pickerStringStateAdapterRaw: PickerStringStateAdapter,
    querySourceAdapterRaw: PickerQuerySourceAdapter,
  ) {
    super(
      eavService,
      fieldsSettingsService,
      translate,
      editRoutingService,
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

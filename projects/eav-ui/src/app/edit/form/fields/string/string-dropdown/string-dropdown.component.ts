import { Component, OnDestroy, OnInit } from '@angular/core';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { EavService, EditRoutingService, FieldsSettingsService } from '../../../../shared/services';
import { FieldMetadata } from '../../../builder/fields-builder/field-metadata.decorator';
import { PickerComponent, pickerProviders } from '../../picker/picker.component';
import { TranslateService } from '@ngx-translate/core';
import { EntityDefaultLogic } from '../../entity/entity-default/entity-default-logic';
import { DeleteEntityProps } from '../../picker/models/picker.models';
import { PickerData } from '../../picker/picker-data';
import { PickerStringSourceAdapter } from '../../picker/adapters/picker-string-source-adapter';
import { PickerStringStateAdapter } from '../../picker/adapters/picker-string-state-adapter';
import { AsyncPipe } from '@angular/common';
import { PickerDialogComponent } from '../../picker/picker-dialog/picker-dialog.component';
import { PickerPreviewComponent } from '../../picker/picker-preview/picker-preview.component';

@Component({
    selector: InputTypeConstants.StringDropdown,
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
@FieldMetadata({
  // wrappers: [WrappersConstants.LocalizationWrapper],
})
export class StringDropdownComponent extends PickerComponent implements OnInit, OnDestroy {
  constructor(
    eavService: EavService,
    fieldsSettingsService: FieldsSettingsService,
    private translate: TranslateService,
    editRoutingService: EditRoutingService,
    private pickerStringSourceAdapterRaw: PickerStringSourceAdapter,
    private pickerStringStateAdapterRaw: PickerStringStateAdapter,
  ) {
    super(
      eavService,
      fieldsSettingsService,
      editRoutingService,
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

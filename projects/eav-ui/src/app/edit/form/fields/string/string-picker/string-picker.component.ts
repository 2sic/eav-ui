import { Component, OnDestroy, OnInit } from '@angular/core';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { EditRoutingService, FieldsSettingsService } from '../../../../shared/services';
import { FieldMetadata } from '../../../builder/fields-builder/field-metadata.decorator';
import { PickerComponent, PickerProviders } from '../../picker/picker.component';
import { TranslateService } from '@ngx-translate/core';
import { DeleteEntityProps } from '../../picker/models/picker.models';
import { PickerData } from '../../picker/picker-data';
import { StringPickerLogic } from './string-picker-logic';
import { PickerStringSourceAdapter } from '../../picker/adapters/picker-string-source-adapter';
import { PickerQuerySourceAdapter } from '../../picker/adapters/picker-query-source-adapter';
import { PickerEntitySourceAdapter } from '../../picker/adapters/picker-entity-source-adapter';
import { PickerConfigModels } from '../../picker/constants/picker-config-model.constants';
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';
import { PickerStringStateAdapter } from '../../picker/adapters/picker-string-state-adapter';
import { AsyncPipe } from '@angular/common';
import { PickerDialogComponent } from '../../picker/picker-dialog/picker-dialog.component';
import { PickerPreviewComponent } from '../../picker/picker-preview/picker-preview.component';

const logThis = false;

@Component({
  selector: InputTypeConstants.StringPicker,
  templateUrl: '../../picker/picker.component.html',
  styleUrls: ['../../picker/picker.component.scss'],
  providers: PickerProviders,
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
export class StringPickerComponent extends PickerComponent implements OnInit, OnDestroy {
  constructor(
    fieldsSettingsService: FieldsSettingsService,
    private translate: TranslateService,
    editRoutingService: EditRoutingService,
    private pickerStringSourceAdapterRaw: PickerStringSourceAdapter,
    private pickerStringStateAdapterRaw: PickerStringStateAdapter,
    private pickerEntitySourceAdapter: PickerEntitySourceAdapter,
    private querySourceAdapterRaw: PickerQuerySourceAdapter,
  ) {
    super(
      fieldsSettingsService,
      editRoutingService,
    );
    this.log = new EavLogger('StringPickerComponent', logThis);
    StringPickerLogic.importMe();
    this.isStringQuery = true;
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
    this.log.a('createPickerAdapters');

    let source: PickerStringSourceAdapter | PickerQuerySourceAdapter | PickerEntitySourceAdapter;

    const state = this.pickerStringStateAdapterRaw.setupFromComponent(this);

    const dataSourceType = this.settings$.value.DataSourceType;
    const isEmpty = !dataSourceType;

    if (dataSourceType === PickerConfigModels.UiPickerSourceCustomList || isEmpty) {
      source = this.pickerStringSourceAdapterRaw.setupString(
        state.settings$,
        state.disableAddNew$,
        this.config,
        this.group,
        (props: DeleteEntityProps) => state.doAfterDelete(props),
        isEmpty,
      );
    }
    else if (dataSourceType === PickerConfigModels.UiPickerSourceQuery)
      source = this.querySourceAdapterRaw.setupFromComponent(this, state).setupQuery(state.error$);
    else if (dataSourceType === PickerConfigModels.UiPickerSourceEntity)
      source = this.pickerEntitySourceAdapter.setupFromComponent(this, state);


    state.init();
    source.init('StringPickerComponent.createPickerAdapters');
    this.pickerData = new PickerData(
      state,
      source,
      this.translate,
    );
  }
}

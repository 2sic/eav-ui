import { Component, OnDestroy, OnInit } from '@angular/core';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { EditRoutingService, FieldsSettingsService } from '../../../../shared/services';
import { PickerComponent, PickerProviders } from '../../picker/picker.component';
import { TranslateService } from '@ngx-translate/core';
import { DeleteEntityProps } from '../../picker/models/picker.models';
import { PickerData } from '../../picker/picker-data';
import { StringPickerLogic } from './string-picker-logic';
import { DataAdapterString } from '../../picker/adapters/picker-string-source-adapter';
import { DataAdapterQuery } from '../../picker/adapters/picker-query-source-adapter';
import { DataAdapterEntity } from '../../picker/adapters/picker-entity-source-adapter';
import { PickerConfigModels } from '../../picker/constants/picker-config-model.constants';
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';
import { StateAdapterString } from '../../picker/adapters/picker-string-state-adapter';
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
export class StringPickerComponent extends PickerComponent implements OnInit, OnDestroy {
  constructor(
    fieldsSettingsService: FieldsSettingsService,
    private translate: TranslateService,
    editRoutingService: EditRoutingService,
    private sourceAdapterStringRaw: DataAdapterString,
    private stateAdapterStringRaw: StateAdapterString,
    private pickerEntitySourceAdapter: DataAdapterEntity,
    private querySourceAdapterRaw: DataAdapterQuery,
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

  protected /* FYI: override */ createPickerAdapters(): void {
    this.log.a('createPickerAdapters');

    let source: DataAdapterString | DataAdapterQuery | DataAdapterEntity;

    const state = this.stateAdapterStringRaw.attachToComponent(this);

    const dataSourceType = this.settings$.value.DataSourceType;
    const isEmpty = !dataSourceType;

    if (dataSourceType === PickerConfigModels.UiPickerSourceCustomList || isEmpty) {
      source = this.sourceAdapterStringRaw.setupString(
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


    state.init('StringPickerComponent');
    source.init('StringPickerComponent');
    this.pickerData = new PickerData(
      state,
      source,
      this.translate,
    );
  }
}

import { Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { PickerComponent } from '../../picker/picker.component';
import { PickerProviders } from '../../picker/picker-providers.constant';
import { TranslateService } from '@ngx-translate/core';
import { DeleteEntityProps } from '../../picker/models/picker.models';
import { PickerData } from '../../picker/picker-data';
import { StringPickerLogic } from './string-picker-logic';
import { DataAdapterString } from '../../picker/adapters/data-adapter-string';
import { DataAdapterQuery } from '../../picker/adapters/data-adapter-query';
import { DataAdapterEntity } from '../../picker/adapters/data-adapter-entity';
import { PickerConfigModels } from '../../picker/constants/picker-config-model.constants';
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';
import { StateAdapterString } from '../../picker/adapters/state-adapter-string';
import { AsyncPipe } from '@angular/common';
import { PickerDialogComponent } from '../../picker/picker-dialog/picker-dialog.component';
import { PickerPreviewComponent } from '../../picker/picker-preview/picker-preview.component';

const logThis = false;
const nameOfThis = 'StringPickerComponent';

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
    private translate: TranslateService,
    private sourceAdapterStringRaw: DataAdapterString,
    private stateAdapterStringRaw: StateAdapterString,
    private pickerEntitySourceAdapter: DataAdapterEntity,
    private querySourceAdapterRaw: DataAdapterQuery,
    private injector: Injector,
  ) {
    super();
    this.log = new EavLogger(nameOfThis, logThis);
    StringPickerLogic.importMe();
    this.isStringQuery = true;
  }

  protected override createPickerAdapters(): void {
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
      source = this.querySourceAdapterRaw.setupFromComponent(this, state, false);
    else if (dataSourceType === PickerConfigModels.UiPickerSourceEntity)
      source = this.pickerEntitySourceAdapter.setupFromComponent(this, state, false);


    state.init(nameOfThis);
    source.init(nameOfThis);
    this.pickerData = new PickerData(
      state,
      source,
      this.translate,
      this.injector,
    );
  }
}

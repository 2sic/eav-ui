import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { EditRoutingService, FieldsSettingsService } from '../../../../shared/services';
import { EntityQueryComponent } from '../../entity/entity-query/entity-query.component';
import { StringDropdownQueryLogic } from './string-dropdown-query-logic';
import { PickerData } from '../../picker/picker-data';
import { PickerProviders } from '../../picker/picker.component';
import { StateAdapterEntity } from '../../picker/adapters/state-adapter-entity';
import { StateAdapterString } from '../../picker/adapters/state-adapter-string';
import { DataAdapterQuery } from '../../picker/adapters/data-adapter-query';
import { AsyncPipe } from '@angular/common';
import { PickerDialogComponent } from '../../picker/picker-dialog/picker-dialog.component';
import { PickerPreviewComponent } from '../../picker/picker-preview/picker-preview.component';

@Component({
  selector: InputTypeConstants.StringDropdownQuery,
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
export class StringDropdownQueryComponent extends EntityQueryComponent implements OnInit, OnDestroy {

  constructor(
    fieldsSettingsService: FieldsSettingsService,
    translate: TranslateService,
    editRoutingService: EditRoutingService,
    stateRaw: StateAdapterEntity,
    private pickerStringStateAdapterRaw: StateAdapterString,
    querySourceAdapterRaw: DataAdapterQuery,
  ) {
    super(
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
    this.log.a('createPickerAdapters');
    const state = this.pickerStringStateAdapterRaw.attachToComponent(this);

    const source = this.querySourceAdapterRaw.setupFromComponent(this, state)
      .setupQuery(state.error$);

    state.init('StringDropdownQueryComponent');
    source.init('StringDropdownQueryComponent');
    this.pickerData = new PickerData(
      state,
      source,
      this.translate,
    );
  }
}

import { Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { EntityQueryComponent } from '../../entity/entity-query/entity-query.component';
import { StringDropdownQueryLogic } from './string-dropdown-query-logic';
import { PickerData } from '../../picker/picker-data';
import { PickerProviders } from '../../picker/picker-providers.constant';
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
    translate: TranslateService,
    stateRaw: StateAdapterEntity,
    private pickerStringStateAdapterRaw: StateAdapterString,
    querySourceAdapterRaw: DataAdapterQuery,
    injector: Injector,
  ) {
    super(
      translate,
      stateRaw,
      querySourceAdapterRaw,
      injector,
    );
    StringDropdownQueryLogic.importMe();
    this.isStringQuery = true;
  }


  protected override createPickerAdapters(): void {
    this.log.a('createPickerAdapters');
    const state = this.pickerStringStateAdapterRaw.attachToComponent(this);

    const source = this.querySourceAdapterRaw.setupFromComponent(this, state, false);

    state.init('StringDropdownQueryComponent');
    source.init('StringDropdownQueryComponent');
    this.pickerData = new PickerData(
      state,
      source,
      this.translate,
      this.injector,
    );
  }
}

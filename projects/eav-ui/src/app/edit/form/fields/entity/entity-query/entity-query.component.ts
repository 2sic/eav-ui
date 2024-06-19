import { Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { PickerComponent } from '../../picker/picker.component';
import { PickerProviders } from '../../picker/picker-providers.constant';
import { EntityQueryLogic } from './entity-query-logic';
import { PickerData } from '../../picker/picker-data';
import { StateAdapterEntity } from '../../picker/adapters/state-adapter-entity';
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';
import { DataAdapterQuery } from '../../picker/adapters/data-adapter-query';
import { AsyncPipe } from '@angular/common';
import { PickerDialogComponent } from '../../picker/picker-dialog/picker-dialog.component';
import { PickerPreviewComponent } from '../../picker/picker-preview/picker-preview.component';

const logThis = false;

@Component({
  selector: InputTypeConstants.EntityQuery,
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
export class EntityQueryComponent extends PickerComponent implements OnInit, OnDestroy {

  constructor(
    protected translate: TranslateService,
    private stateRaw: StateAdapterEntity,
    protected querySourceAdapterRaw: DataAdapterQuery,
    protected injector: Injector,
  ) {
    super();
    this.log = new EavLogger('EntityQueryComponent', logThis);
    this.log.a('constructor');
    EntityQueryLogic.importMe();
    this.isStringQuery = false;
  }

  protected override createPickerAdapters(): void {
    this.log.a('createPickerAdapters');
    const state = this.stateRaw.attachToComponent(this);

    this.log.a('createPickerAdapters: PickerConfigModels.UiPickerSourceQuery');
    const source = this.querySourceAdapterRaw.setupFromComponent(this, state, false);

    state.init('EntityQueryComponent');
    source.init('EntityQueryComponent');
    this.pickerData = new PickerData(
      state,
      source,
      this.translate,
      // this.injector,
    );
  }
}

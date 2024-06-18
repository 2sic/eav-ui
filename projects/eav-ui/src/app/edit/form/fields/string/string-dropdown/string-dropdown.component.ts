import { Component, Injector, OnDestroy, OnInit, inject } from '@angular/core';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { PickerComponent } from '../../picker/picker.component';
import { PickerProviders } from '../../picker/picker-providers.constant';
import { TranslateService } from '@ngx-translate/core';
import { EntityDefaultLogic } from '../../entity/entity-default/entity-default-logic';
import { DeleteEntityProps } from '../../picker/models/picker.models';
import { PickerData } from '../../picker/picker-data';
import { DataAdapterString } from '../../picker/adapters/data-adapter-string';
import { StateAdapterString } from '../../picker/adapters/state-adapter-string';
import { AsyncPipe } from '@angular/common';
import { PickerDialogComponent } from '../../picker/picker-dialog/picker-dialog.component';
import { PickerPreviewComponent } from '../../picker/picker-preview/picker-preview.component';
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';

const logThis = false;
const nameOfThis = 'StringDropdownComponent';

@Component({
  selector: InputTypeConstants.StringDropdown,
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
export class StringDropdownComponent extends PickerComponent implements OnInit, OnDestroy {

  private translate = inject(TranslateService);
  private pickerStringSourceAdapterRaw = inject(DataAdapterString);
  private pickerStringStateAdapterRaw = inject(StateAdapterString);
  private injector = inject(Injector);

  constructor() {
    super(new EavLogger(nameOfThis, logThis));
    EntityDefaultLogic.importMe();
  }

  protected override createPickerAdapters(): void {
    this.log.a('createPickerAdapters');
    const state = this.pickerStringStateAdapterRaw.attachToComponent(this);

    const source = this.pickerStringSourceAdapterRaw.setupString(
      state.settings,
      this.config,
      this.group,
      (props: DeleteEntityProps) => state.doAfterDelete(props),
      false,
    );

    state.init('StringDropdownComponent');
    source.init('StringDropdownComponent');
    this.pickerData = new PickerData(
      state,
      source,
      this.translate,
      // this.injector,
    );
  }
}

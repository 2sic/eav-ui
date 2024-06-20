import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { PickerComponent } from '../../picker/picker.component';
import { PickerImports, PickerProviders } from '../../picker/picker-providers.constant';
import { EntityDefaultLogic } from '../../entity/entity-default/entity-default-logic';
import { DeleteEntityProps } from '../../picker/models/picker.models';
import { DataAdapterString } from '../../picker/adapters/data-adapter-string';
import { StateAdapterString } from '../../picker/adapters/state-adapter-string';
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';

const logThis = false;
const nameOfThis = 'StringDropdownComponent';

@Component({
  selector: InputTypeConstants.StringDropdown,
  templateUrl: '../../picker/picker.component.html',
  styleUrls: ['../../picker/picker.component.scss'],
  providers: PickerProviders,
  standalone: true,
  imports: PickerImports,
})
export class StringDropdownComponent extends PickerComponent implements OnInit, OnDestroy {

  private pickerStringSourceAdapterRaw = inject(DataAdapterString);
  private pickerStringStateAdapterRaw = inject(StateAdapterString);

  constructor() {
    super(new EavLogger(nameOfThis, logThis));
    EntityDefaultLogic.importMe();
  }

  protected override createPickerAdapters(): void {
    this.log.a('createPickerAdapters');
    const state = this.pickerStringStateAdapterRaw.attachToComponent(this);

    const source = this.pickerStringSourceAdapterRaw.setupString(
      (props: DeleteEntityProps) => state.doAfterDelete(props),
      false,
    );

    this.pickerData.setup(nameOfThis, state, source);
  }
}

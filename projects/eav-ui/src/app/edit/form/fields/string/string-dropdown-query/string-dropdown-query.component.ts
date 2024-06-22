import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { EntityQueryComponent } from '../../entity/entity-query/entity-query.component';
import { StringDropdownQueryLogic } from './string-dropdown-query-logic';
import { PickerImports, PickerProviders } from '../../picker/picker-providers.constant';
import { StateAdapterString } from '../../picker/adapters/state-adapter-string';

const logThis = false;
const nameOfThis = 'StringDropdownQueryComponent';

@Component({
  selector: InputTypeConstants.StringDropdownQuery,
  templateUrl: '../../picker/picker.component.html',
  styleUrls: ['../../picker/picker.component.scss'],
  providers: PickerProviders,
  standalone: true,
  imports: PickerImports,
})
export class StringDropdownQueryComponent extends EntityQueryComponent implements OnInit, OnDestroy {

  private stateString = inject(StateAdapterString);

  constructor() {
    super();
    StringDropdownQueryLogic.importMe();
  }


  protected override createPickerAdapters(): void {
    this.log.a('createPickerAdapters');
    const state = this.stateString.attachToComponent(this);

    const source = this.querySourceAdapterRaw.linkLog(this.log).connectState(state, false);

    this.pickerData.setup(nameOfThis, state, source);
  }
}

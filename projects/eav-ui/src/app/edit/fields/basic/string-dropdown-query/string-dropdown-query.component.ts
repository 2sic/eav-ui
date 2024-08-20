import { Component, OnDestroy, OnInit } from '@angular/core';
import { StringDropdownQueryLogic } from './string-dropdown-query-logic';
import { InputTypeConstants } from '../../../../content-type-fields/constants/input-type.constants';
import { EntityQueryComponent } from '../entity-query/entity-query.component';
import { StateAdapterString } from '../../picker/adapters/state-adapter-string';
import { PickerImports } from '../../picker/picker-providers.constant';
import { transient } from '../../../../core/transient';

const logThis = false;
const nameOfThis = 'StringDropdownQueryComponent';

@Component({
  selector: InputTypeConstants.StringDropdownQuery,
  templateUrl: '../../picker/picker.component.html',
  styleUrls: ['../../picker/picker.component.scss'],
  standalone: true,
  imports: PickerImports,
})
export class StringDropdownQueryComponent extends EntityQueryComponent implements OnInit, OnDestroy {

  private stateString = transient(StateAdapterString);

  constructor() {
    super();
    StringDropdownQueryLogic.importMe();
  }

  protected override createPickerAdapters(): void {
    this.log.a('createPickerAdapters');
    const state = this.stateString.linkLog(this.log).attachCallback(this.focusOnSearchComponent);

    const source = this.querySourceAdapterRaw.linkLog(this.log).connectState(state, false);

    this.pickerData.setup(nameOfThis, state, source);
  }
}

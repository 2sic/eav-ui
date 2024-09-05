import { Component, OnDestroy, OnInit } from '@angular/core';
import { StringDropdownQueryLogic } from './string-dropdown-query-logic';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { PickerImports } from '../../picker/picker-providers.constant';
import { PickerComponent } from '../../picker/picker.component';
import { EavLogger } from '../../../../shared/logging/eav-logger';

const logSpecs = {
  enabled: false,
  name: 'StringDropdownQueryComponent',
};

@Component({
  selector: InputTypeCatalog.StringDropdownQuery,
  templateUrl: '../../picker/picker.component.html',
  styleUrls: ['../../picker/picker.component.scss'],
  standalone: true,
  imports: PickerImports,
})
export class StringDropdownQueryComponent extends PickerComponent implements OnInit, OnDestroy {

  constructor() {
    super(new EavLogger(logSpecs));
    StringDropdownQueryLogic.importMe();
  }
}

import { Component, OnDestroy, OnInit } from '@angular/core';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { EntityDefaultLogic } from '../entity-default/entity-default-logic';
import { PickerImports } from '../../picker/picker-providers.constant';
import { PickerComponent } from '../../picker/picker.component';
import { EavLogger } from '../../../../shared/logging/eav-logger';

const logSpecs = {
  enabled: false,
  name: 'StringDropdownComponent',
};

@Component({
  selector: InputTypeCatalog.StringDropdown,
  templateUrl: '../../picker/picker.component.html',
  styleUrls: ['../../picker/picker.component.scss'],
  standalone: true,
  imports: PickerImports,
})
export class StringDropdownComponent extends PickerComponent implements OnInit, OnDestroy {

  constructor() {
    super(new EavLogger(logSpecs));
    EntityDefaultLogic.importMe();
  }

}

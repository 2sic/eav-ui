import { Component, OnDestroy, OnInit } from '@angular/core';
import { EntityDefaultLogic } from './entity-default-logic';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { PickerImports } from '../../picker/picker-providers.constant';
import { PickerComponent } from '../../picker/picker.component';
import { EavLogger } from '../../../../shared/logging/eav-logger';

const logSpecs = {
  enabled: false,
  name: 'EntityDefaultComponent',
};

@Component({
  selector: InputTypeCatalog.EntityDefault,
  templateUrl: '../../picker/picker.component.html',
  styleUrls: ['../../picker/picker.component.scss'],
  standalone: true,
  imports: PickerImports,
})
export class EntityDefaultComponent extends PickerComponent implements OnInit, OnDestroy {

  constructor() {
    super(new EavLogger(logSpecs));
    EntityDefaultLogic.importMe();
    this.pickerDataFactory.setupPickerData(this.pickerData, this.fieldState);
  }
}

import { Component, OnDestroy, OnInit } from '@angular/core';
import { EntityPickerLogic } from './entity-picker-logic';
import { PickerImports } from '../../picker/picker-providers.constant';
import { PickerComponent } from '../../picker/picker.component';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { classLog } from '../../../../shared/logging/logging';

@Component({
  selector: InputTypeCatalog.EntityPicker,
  templateUrl: '../../picker/picker.component.html',
  styleUrls: ['../../picker/picker.component.scss'],
  standalone: true,
  imports: PickerImports,
})
export class EntityPickerComponent extends PickerComponent implements OnInit, OnDestroy {

  constructor() {
    super(classLog({EntityPickerComponent}, PickerComponent.logSpecs));
    EntityPickerLogic.importMe();
  }

}

import { Component, OnDestroy, OnInit } from '@angular/core';
import { EntityPickerLogic } from './entity-picker-logic';
import { PickerImports } from '../../picker/picker-providers.constant';
import { PickerComponent } from '../../picker/picker.component';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { EavLogger } from '../../../../shared/logging/eav-logger';

const logSpecs = {
  enabled: false,
  name: 'EntityPickerComponent',
};

@Component({
  selector: InputTypeCatalog.EntityPicker,
  templateUrl: '../../picker/picker.component.html',
  styleUrls: ['../../picker/picker.component.scss'],
  standalone: true,
  imports: PickerImports,
})
export class EntityPickerComponent extends PickerComponent implements OnInit, OnDestroy {

  constructor() {
    super(new EavLogger(logSpecs));
    EntityPickerLogic.importMe();
  }

}

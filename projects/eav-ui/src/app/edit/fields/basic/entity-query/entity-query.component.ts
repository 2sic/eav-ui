import { Component, OnDestroy, OnInit } from '@angular/core';
import { EntityQueryLogic } from './entity-query-logic';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { PickerImports } from '../../picker/picker-providers.constant';
import { PickerComponent } from '../../picker/picker.component';
import { EavLogger } from '../../../../shared/logging/eav-logger';

const logSpecs = {
  ...PickerComponent.logSpecs,
  enabled: false,
  name: 'EntityQueryComponent',
};

@Component({
  selector: InputTypeCatalog.EntityQuery,
  templateUrl: '../../picker/picker.component.html',
  styleUrls: ['../../picker/picker.component.scss'],
  standalone: true,
  imports: PickerImports,
})
export class EntityQueryComponent extends PickerComponent implements OnInit, OnDestroy {

  constructor() {
    super(new EavLogger(logSpecs));
    EntityQueryLogic.importMe();
  }
}

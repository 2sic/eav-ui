import { Component, OnDestroy, OnInit } from '@angular/core';
import { EntityContentBlocksLogic } from './entity-content-blocks-logic';
import { EntityDefaultComponent } from '../entity-default/entity-default.component';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { PickerImports } from '../../picker/picker-providers.constant';

@Component({
  selector: InputTypeCatalog.EntityContentBlocks,
  templateUrl: '../../picker/picker.component.html',
  styleUrls: ['../../picker/picker.component.scss'],
  standalone: true,
  imports: PickerImports,
})
export class EntityContentBlockComponent extends EntityDefaultComponent implements OnInit, OnDestroy {

  constructor() {
    super();
    EntityContentBlocksLogic.importMe();
  }
}

import { Component, OnDestroy, OnInit } from '@angular/core';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { PickerImports } from '../../picker/picker-providers.constant';
import { EntityDefaultComponent } from '../entity-default/entity-default';
import { EntityContentBlocksLogic } from './entity-content-blocks-logic';

@Component({
    selector: InputTypeCatalog.EntityContentBlocks,
    templateUrl: '../../picker/picker.html',
    imports: PickerImports
})
export class EntityContentBlockComponent extends EntityDefaultComponent implements OnInit, OnDestroy {

  constructor() {
    super();
    EntityContentBlocksLogic.importMe();
  }
}

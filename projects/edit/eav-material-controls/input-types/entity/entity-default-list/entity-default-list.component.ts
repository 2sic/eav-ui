import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

import { FieldConfigSet } from '../../../../eav-dynamic-form/model/field-config';
import { FieldSettings } from '../../../../../edit-types';
import { SelectedEntity, DeleteEntityProps } from '../entity-default/entity-default.models';
import { ReorderIndexes } from './entity-default-list.models';

@Component({
  selector: 'app-entity-default-list',
  templateUrl: './entity-default-list.component.html',
  styleUrls: ['./entity-default-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EntityDefaultListComponent {
  @Input() config: FieldConfigSet;
  @Input() label: string;
  @Input() required: boolean;
  @Input() disabled: boolean;
  @Input() freeTextMode: boolean;
  @Input() settings: FieldSettings;
  @Input() selectedEntities: SelectedEntity[];

  @Output() reorder = new EventEmitter<ReorderIndexes>();
  @Output() removeSelected = new EventEmitter<number>();
  @Output() editEntity = new EventEmitter<string>();
  @Output() deleteEntity = new EventEmitter<DeleteEntityProps>();

  constructor() { }

  trackByFn(index: number, item: SelectedEntity) {
    return item.value;
  }

  drop(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.selectedEntities, event.previousIndex, event.currentIndex);
    const reorderIndexes: ReorderIndexes = {
      previousIndex: event.previousIndex,
      currentIndex: event.currentIndex,
    };
    this.reorder.emit(reorderIndexes);
  }

  edit(entityGuid: string) {
    this.editEntity.emit(entityGuid);
  }

  removeItem(index: number) {
    this.removeSelected.emit(index);
  }

  deleteItem(index: number, entityGuid: string) {
    this.deleteEntity.emit({ index, entityGuid });
  }
}

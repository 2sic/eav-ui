import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { combineLatest, distinctUntilChanged, map, Observable } from 'rxjs';
import { GeneralHelpers } from '../../../../../shared/helpers';
import { FieldsSettingsService } from '../../../../../shared/services';
import { FieldConfigSet } from '../../../../builder/fields-builder/field-config-set.model';
import { DeleteEntityProps, SelectedEntity } from '../entity-default.models';
import { EntityListTemplateVars, ReorderIndexes } from './entity-default-list.models';

@Component({
  selector: 'app-entity-default-list',
  templateUrl: './entity-default-list.component.html',
  styleUrls: ['./entity-default-list.component.scss'],
})
export class EntityDefaultListComponent implements OnInit {
  @Input() config: FieldConfigSet;
  @Input() label: string;
  @Input() required: boolean;
  @Input() disabled: boolean;
  @Input() selectedEntities: SelectedEntity[];

  @Output() private reorder = new EventEmitter<ReorderIndexes>();
  @Output() private removeSelected = new EventEmitter<number>();
  @Output() private editEntity = new EventEmitter<{ entityGuid: string, entityId: number }>();
  @Output() private deleteEntity = new EventEmitter<DeleteEntityProps>();

  templateVars$: Observable<EntityListTemplateVars>;

  constructor(private fieldsSettingsService: FieldsSettingsService) { }

  ngOnInit(): void {
    const settings$ = this.fieldsSettingsService.getFieldSettings$(this.config.fieldName).pipe(
      map(settings => ({
        AllowMultiValue: settings.AllowMultiValue,
        EnableEdit: settings.EnableEdit,
        EnableDelete: settings.EnableDelete,
        EnableRemove: settings.EnableRemove,
      })),
      distinctUntilChanged(GeneralHelpers.objectsEqual),
    );
    this.templateVars$ = combineLatest([settings$]).pipe(
      map(([settings]) => {
        const templateVars: EntityListTemplateVars = {
          allowMultiValue: settings.AllowMultiValue,
          enableEdit: settings.EnableEdit,
          enableDelete: settings.EnableDelete,
          enableRemove: settings.EnableRemove,
        };
        return templateVars;
      }),
    );
  }

  trackByFn(index: number, item: SelectedEntity): string {
    return item.value;
  }

  drop(event: CdkDragDrop<SelectedEntity[]>): void {
    moveItemInArray(this.selectedEntities, event.previousIndex, event.currentIndex);
    const reorderIndexes: ReorderIndexes = {
      previousIndex: event.previousIndex,
      currentIndex: event.currentIndex,
    };
    this.reorder.emit(reorderIndexes);
  }

  edit(entityGuid: string, entityId: number): void {
    this.editEntity.emit({ entityGuid, entityId });
  }

  removeItem(index: number): void {
    this.removeSelected.emit(index);
  }

  deleteItem(index: number, entityGuid: string): void {
    this.deleteEntity.emit({ index, entityGuid });
  }
}

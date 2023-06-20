import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, Input, OnInit } from '@angular/core';
import { combineLatest, distinctUntilChanged, map, Observable } from 'rxjs';
import { GeneralHelpers } from '../../../../shared/helpers';
import { FieldsSettingsService } from '../../../../shared/services';
import { SelectedEntity } from '../../entity/entity-default/entity-default.models';
import { PickerSourceAdapter } from '../picker-source-adapter';
import { PickerStateAdapter } from '../picker-state-adapter';
import { EntityListViewModel, ReorderIndexes } from './picker-list.models';
import { FormGroup } from '@angular/forms';
import { FieldConfigSet } from '../../../builder/fields-builder/field-config-set.model';

@Component({
  selector: 'app-picker-list',
  templateUrl: './picker-list.component.html',
  styleUrls: ['./picker-list.component.scss'],
})
export class PickerListComponent implements OnInit {
  @Input() pickerSourceAdapter: PickerSourceAdapter;
  @Input() pickerStateAdapter: PickerStateAdapter;
  @Input() config: FieldConfigSet;
  @Input() group: FormGroup;

  viewModel$: Observable<EntityListViewModel>;

  constructor(private fieldsSettingsService: FieldsSettingsService) { }

  ngOnInit(): void {
    const label$ = this.pickerStateAdapter.label$;
    const required$ = this.pickerStateAdapter.required$;
    const controlStatus$ = this.pickerStateAdapter.controlStatus$;
    const selectedEntities$ = this.pickerStateAdapter.selectedEntities$;

    const settings$ = this.fieldsSettingsService.getFieldSettings$(this.config.fieldName).pipe(
      map(settings => ({
        allowMultiValue: settings.AllowMultiValue,
        enableEdit: settings.EnableEdit,
        enableDelete: settings.EnableDelete,
        enableRemove: settings.EnableRemove,
      })),
      distinctUntilChanged(GeneralHelpers.objectsEqual),
    );
    this.viewModel$ = combineLatest([
      settings$, label$, required$, controlStatus$, selectedEntities$
    ]).pipe(
      map(([
        settings, label, required, controlStatus, selectedEntities
      ]) => {
        const viewModel: EntityListViewModel = {
          allowMultiValue: settings.allowMultiValue,
          enableEdit: settings.enableEdit,
          enableDelete: settings.enableDelete,
          enableRemove: settings.enableRemove,
          label,
          required,
          controlStatus,
          selectedEntities
        };
        return viewModel;
      }),
    );
  }

  trackByFn(index: number, item: SelectedEntity): string {
    return item.value;
  }

  drop(event: CdkDragDrop<SelectedEntity[]>, selectedEntities: SelectedEntity[]): void {
    moveItemInArray(selectedEntities, event.previousIndex, event.currentIndex);
    const reorderIndexes: ReorderIndexes = {
      previousIndex: event.previousIndex,
      currentIndex: event.currentIndex,
    };
    this.pickerStateAdapter.reorder(reorderIndexes);
  }

  edit(entityGuid: string, entityId: number): void {
    this.pickerSourceAdapter.editEntity({ entityGuid, entityId });
  }

  removeItem(index: number): void {
    this.pickerStateAdapter.removeSelected(index);
  }

  deleteItem(index: number, entityGuid: string): void {
    this.pickerSourceAdapter.deleteEntity({ index, entityGuid });
  }
}

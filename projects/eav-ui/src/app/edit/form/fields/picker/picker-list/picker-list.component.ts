import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, Input, OnInit } from '@angular/core';
import { combineLatest, distinctUntilChanged, map, Observable } from 'rxjs';
import { GeneralHelpers } from '../../../../shared/helpers';
import { FieldsSettingsService } from '../../../../shared/services';
import { EntityListViewModel, ReorderIndexes } from './picker-list.models';
import { FormGroup } from '@angular/forms';
import { FieldConfigSet } from '../../../builder/fields-builder/field-config-set.model';
import { WIPDataSourceItem } from 'projects/edit-types';
import { createUIModel } from '../picker.helpers';
import { TranslateService } from '@ngx-translate/core';
import { PickerData } from '../picker-data';

@Component({
  selector: 'app-picker-list',
  templateUrl: './picker-list.component.html',
  styleUrls: ['./picker-list.component.scss'],
})
export class PickerListComponent implements OnInit {
  @Input() pickerData: PickerData;
  @Input() config: FieldConfigSet;
  @Input() group: FormGroup;

  viewModel$: Observable<EntityListViewModel>;

  constructor(
    private fieldsSettingsService: FieldsSettingsService,
    private translate: TranslateService,
  ) { }

  ngOnInit(): void {
    const state = this.pickerData.state;
    const source = this.pickerData.source;

    const label$ = state.label$;
    const required$ = state.required$;
    const controlStatus$ = state.controlStatus$;
    // @SDV move most of this code to picker.helpers - NOT YET
    const selectedItems$ = combineLatest([
      state.selectedItems$.pipe(distinctUntilChanged(GeneralHelpers.arraysEqual)),
      source.getDataFromSource().pipe(distinctUntilChanged(GeneralHelpers.arraysEqual)),
      source.parameters$.pipe(distinctUntilChanged()),
    ]).pipe(//tap(([selectedItems, data, contentType]) => console.log('SDV SEARCH')),
      map(([selectedItems, data, parameters]) =>
        createUIModel(selectedItems, data, parameters,
          (parameters, missingData) => source.prefetch(parameters, missingData),
          this.translate)
      ), distinctUntilChanged(GeneralHelpers.arraysEqual)
    );

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
      settings$, label$, required$, controlStatus$, selectedItems$
    ]).pipe(
      map(([
        settings, label, required, controlStatus, selectedItems
      ]) => {
        const viewModel: EntityListViewModel = {
          allowMultiValue: settings.allowMultiValue,
          enableEdit: settings.enableEdit,
          enableDelete: settings.enableDelete,
          enableRemove: settings.enableRemove,
          label,
          required,
          controlStatus,
          selectedItems
        };
        return viewModel;
      }),
    );
  }

  trackByFn(index: number, item: WIPDataSourceItem): string {
    return item.Value;
  }

  drop(event: CdkDragDrop<WIPDataSourceItem[]>, selectedEntities: WIPDataSourceItem[]): void {
    moveItemInArray(selectedEntities, event.previousIndex, event.currentIndex);
    const reorderIndexes: ReorderIndexes = {
      previousIndex: event.previousIndex,
      currentIndex: event.currentIndex,
    };
    this.pickerData.state.reorder(reorderIndexes);
  }

  edit(entityGuid: string, entityId: number): void {
    this.pickerData.source.editItem({ entityGuid, entityId });
  }

  removeItem(index: number): void {
    this.pickerData.state.removeSelected(index);
  }

  deleteItem(index: number, entityGuid: string): void {
    this.pickerData.source.deleteItem({ index, entityGuid });
  }
}

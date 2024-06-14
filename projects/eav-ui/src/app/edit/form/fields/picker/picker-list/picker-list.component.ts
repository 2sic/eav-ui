import { CdkDragDrop, moveItemInArray, CdkDropList, CdkDrag } from '@angular/cdk/drag-drop';
import { Component, Input, OnInit, computed, input } from '@angular/core';
import { combineLatest, distinctUntilChanged, map, Observable } from 'rxjs';
import { FieldsSettingsService } from '../../../../shared/services';
import { EntityListViewModel, ReorderIndexes } from './picker-list.models';
import { FormGroup } from '@angular/forms';
import { FieldConfigSet } from '../../../builder/fields-builder/field-config-set.model';
import { PickerItem } from 'projects/edit-types';
import { PickerData } from '../picker-data';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { SharedComponentsModule } from '../../../../../shared/shared-components.module';
import { MatIconModule } from '@angular/material/icon';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { NgClass, AsyncPipe } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { RxHelpers } from 'projects/eav-ui/src/app/shared/rxJs/rx.helpers';

@Component({
    selector: 'app-picker-list',
    templateUrl: './picker-list.component.html',
    styleUrls: ['./picker-list.component.scss'],
    standalone: true,
    imports: [
        MatFormFieldModule,
        NgClass,
        ExtendedModule,
        CdkDropList,
        CdkDrag,
        MatIconModule,
        SharedComponentsModule,
        MatButtonModule,
        AsyncPipe,
        TranslateModule,
    ],
})
export class PickerListComponent implements OnInit {
  pickerData = input.required<PickerData>();
  @Input() config: FieldConfigSet;
  @Input() group: FormGroup;

  viewModel$: Observable<EntityListViewModel>;

  /** Label to show from the picker data. Is not auto-attached, since it's not the initial/top-level component. */
  label = computed(() => this.pickerData().state.label());

  constructor(
    private fieldsSettingsService: FieldsSettingsService,
  ) { }

  ngOnInit(): void {
    const pd = this.pickerData();
    const state = pd.state;

    const required$ = state.required$;
    const controlStatus$ = state.controlStatus$;
    const selectedItems$ = pd.selectedItems$;

    const settings$ = this.fieldsSettingsService.getFieldSettings$(this.config.fieldName).pipe(
      map(settings => ({
        allowMultiValue: settings.AllowMultiValue,
        enableEdit: settings.EnableEdit,
        enableDelete: settings.EnableDelete,
        enableRemove: settings.EnableRemove,
      })),
      distinctUntilChanged(RxHelpers.objectsEqual),
    );
    this.viewModel$ = combineLatest([
      settings$, required$, controlStatus$, selectedItems$
    ]).pipe(
      map(([
        settings, required, controlStatus, selectedItems
      ]) => {
        const csDisabled = controlStatus.disabled;
        const viewModel: EntityListViewModel = {
          allowMultiValue: settings.allowMultiValue,
          enableEdit: settings.enableEdit,
          enableDelete: settings.enableDelete,
          enableRemove: settings.enableRemove,
          required,
          selectedItems,

          csDisabled,
        };
        return viewModel;
      }),
    );
  }

  trackByFn(index: number, item: PickerItem): string {
    return item.value;
  }

  drop(event: CdkDragDrop<PickerItem[]>, selectedEntities: PickerItem[]): void {
    moveItemInArray(selectedEntities, event.previousIndex, event.currentIndex);
    const reorderIndexes: ReorderIndexes = {
      previousIndex: event.previousIndex,
      currentIndex: event.currentIndex,
    };
    this.pickerData().state.reorder(reorderIndexes);
  }

  edit(entityGuid: string, entityId: number): void {
    this.pickerData().source.editItem({ entityGuid, entityId }, null);
  }

  removeItem(index: number): void {
    this.pickerData().state.removeSelected(index);
  }

  deleteItem(index: number, entityGuid: string): void {
    this.pickerData().source.deleteItem({ index, entityGuid });
  }
}

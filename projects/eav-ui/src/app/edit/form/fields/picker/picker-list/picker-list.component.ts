import { CdkDragDrop, moveItemInArray, CdkDropList, CdkDrag } from '@angular/cdk/drag-drop';
import { Component, OnDestroy, computed } from '@angular/core';
import { ReorderIndexes } from './reorder-index.models';
import { PickerItem } from 'projects/edit-types';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { SharedComponentsModule } from '../../../../../shared/shared-components.module';
import { MatIconModule } from '@angular/material/icon';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { NgClass, AsyncPipe } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { PickerPartBaseComponent } from '../picker-part-base.component';
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';
import { SignalHelpers } from 'projects/eav-ui/src/app/shared/helpers/signal.helpers';
import { RxHelpers } from 'projects/eav-ui/src/app/shared/rxJs/rx.helpers';

const logThis = false;
const nameOfThis = 'PickerListComponent';

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
export class PickerListComponent extends PickerPartBaseComponent implements OnDestroy {

  mySettings = computed(() => {
    const settings = this.pickerData().state.settings();
    return {
      allowMultiValue: settings.AllowMultiValue,
      enableEdit: settings.EnableEdit,
      enableDelete: settings.EnableDelete,
      enableRemove: settings.EnableRemove,
    };
  }, { equal: RxHelpers.objectsEqual });

  constructor() {
    super(new EavLogger(nameOfThis, logThis));
  }

  trackByFn(_: number, item: PickerItem): string {
    return item.value;
  }

  drop(event: CdkDragDrop<PickerItem[]>): void {
    const selectedEntities = this.pickerData().selectedAll();
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

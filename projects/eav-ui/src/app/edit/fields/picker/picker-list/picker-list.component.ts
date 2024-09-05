import { CdkDragDrop, moveItemInArray, CdkDropList, CdkDrag } from '@angular/cdk/drag-drop';
import { Component } from '@angular/core';
import { ReorderIndexes } from './reorder-index.models';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { NgClass, AsyncPipe } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { PickerPartBaseComponent } from '../picker-part-base.component';
import { TippyDirective } from '../../../../shared/directives/tippy.directive';
import { MousedownStopPropagationDirective } from '../../../../shared/directives/mousedown-stop-propagation.directive';
import { EavLogger } from '../../../../shared/logging/eav-logger';
import { PickerItem } from '../models/picker-item.model';
import { computedObj } from '../../../../shared/signals/signal.utilities';

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
    MatButtonModule,
    AsyncPipe,
    TranslateModule,
    TippyDirective,
    MousedownStopPropagationDirective,
  ],
})
export class PickerListComponent extends PickerPartBaseComponent {

  mySettings = computedObj('mySettings', () => {
    const settings = this.fieldState.settings();
    return {
      allowMultiValue: settings.AllowMultiValue,
      enableEdit: settings.EnableEdit,
      enableDelete: settings.EnableDelete,
      enableRemove: settings.EnableRemove,
    };
  });

  constructor() {
    super(new EavLogger(nameOfThis, logThis));
  }

  trackByFn(_: number, item: PickerItem): string {
    return item.value;
  }

  drop(event: CdkDragDrop<PickerItem[]>): void {
    const selectedEntities = this.pickerData.selectedAll();
    moveItemInArray(selectedEntities, event.previousIndex, event.currentIndex);
    const reorderIndexes: ReorderIndexes = {
      previousIndex: event.previousIndex,
      currentIndex: event.currentIndex,
    };
    this.pickerData.state.reorder(reorderIndexes);
  }

  edit(entityGuid: string, entityId: number): void {
    this.pickerData.source.editItem({ entityGuid, entityId }, null);
  }

  removeItem(index: number): void {
    this.pickerData.state.removeSelected(index);
  }

  deleteItem(index: number, entityGuid: string): void {
    this.pickerData.source.deleteItem({ index, entityGuid });
  }
}

import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { MousedownStopPropagationDirective } from '../../../../shared/directives/mousedown-stop-propagation.directive';
import { TippyDirective } from '../../../../shared/directives/tippy.directive';
import { classLog } from '../../../../shared/logging';
import { PickerItem } from '../models/picker-item.model';
import { PickerItemButtonsComponent } from '../picker-item-buttons/picker-item-buttons.component';
import { PickerPartBaseComponent } from '../picker-part-base.component';
import { ReorderIndexes } from './reorder-index.models';

@Component({
  selector: 'app-picker-list',
  templateUrl: './picker-list.component.html',
  styleUrls: ['./picker-list.component.scss'],
  standalone: true,
  imports: [
    MatFormFieldModule,
    TranslateModule,
    ExtendedModule,
    MatIconModule,
    MatButtonModule,
    NgClass,
    CdkDropList,
    CdkDrag,
    PickerItemButtonsComponent,
    TippyDirective,
    MousedownStopPropagationDirective,
  ],
})
export class PickerListComponent extends PickerPartBaseComponent {
  
  log = classLog({PickerListComponent});

  constructor() { super(); }

  allowMultiValue = this.fieldState.setting('AllowMultiValue');

  drop(event: CdkDragDrop<PickerItem[]>): void {
    const selectedEntities = this.pickerData.selectedAll();
    moveItemInArray(selectedEntities, event.previousIndex, event.currentIndex);
    const reorderIndexes: ReorderIndexes = {
      previousIndex: event.previousIndex,
      currentIndex: event.currentIndex,
    };
    this.pickerData.state.reorder(reorderIndexes);
  }

}

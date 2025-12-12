import { CdkDrag, CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { TippyDirective } from '../../../../shared/directives/tippy.directive';
import { classLog } from '../../../../shared/logging';
import { PickerItem } from '../models/picker-item.model';
import { PickerItemButtonsComponent } from '../picker-item-buttons/picker-item-buttons';
import { PickerPartBaseComponent } from '../picker-part-base';
import { ReorderIndexes } from './reorder-index.models';

@Component({
    selector: 'app-picker-list',
    templateUrl: './picker-list.html',
    styleUrls: ['./picker-list.scss'],
    imports: [
        MatFormFieldModule,
        MatIconModule,
        MatButtonModule,
        NgClass,
        CdkDropList,
        CdkDrag,
        PickerItemButtonsComponent,
        TippyDirective,
    ]
})
export class PickerListComponent extends PickerPartBaseComponent {
  
  log = classLog({PickerListComponent});

  constructor() { super(); }

  drop(event: CdkDragDrop<PickerItem[]>): void {
    this.pickerData.state.reorder({
      previousIndex: event.previousIndex,
      currentIndex: event.currentIndex,
    } satisfies ReorderIndexes);
  }

}

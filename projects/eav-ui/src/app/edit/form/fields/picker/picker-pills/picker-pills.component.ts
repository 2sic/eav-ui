import { Component, OnDestroy, computed } from '@angular/core';
import { EditRoutingService } from '../../../../shared/services';
import { PickerItem } from 'projects/edit-types';
import { MatListModule } from '@angular/material/list';
import { FlexModule } from '@angular/flex-layout/flex';
import { MatRippleModule } from '@angular/material/core';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { NgClass } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { PickerPartBaseComponent } from '../picker-part-base.component';

@Component({
  selector: 'app-picker-pills',
  templateUrl: './picker-pills.component.html',
  styleUrls: ['./picker-pills.component.scss'],
  standalone: true,
  imports: [
    MatFormFieldModule,
    NgClass,
    ExtendedModule,
    MatRippleModule,
    FlexModule,
    MatListModule,
  ],
})
export class PickerPillsComponent extends PickerPartBaseComponent implements OnDestroy {

  enableTextEntry = computed(() => this.pickerData().state.settings().EnableTextEntry);

  itemCount = computed(() => this.selectedItems().length);

  constructor(private editRoutingService: EditRoutingService) {
    super();
  }

  trackByFn(_: number, item: PickerItem) {
    return item.value;
  }

  expandDialog() {
    const config = this.config();
    if (config.initialDisabled) return;
    this.editRoutingService.expand(true, config.index, config.entityGuid);
  }
}

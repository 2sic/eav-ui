import { Component } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { FlexModule } from '@angular/flex-layout/flex';
import { MatRippleModule } from '@angular/material/core';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { NgClass } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { PickerPartBaseComponent } from '../picker-part-base.component';
import { PickerItem } from '../models/picker-item.model';
import { computedObj } from '../../../../shared/signals/signal.utilities';

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
export class PickerPillsComponent extends PickerPartBaseComponent {

  constructor() { super(); }

  itemCount = computedObj('itemCount', () => this.selectedItems().length);
}

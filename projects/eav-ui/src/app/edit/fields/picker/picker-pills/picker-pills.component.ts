import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatListModule } from '@angular/material/list';
import { PickerPartBaseComponent } from '../picker-part-base.component';

@Component({
  selector: 'app-picker-pills',
  templateUrl: './picker-pills.component.html',
  styleUrls: ['./picker-pills.component.scss'],
  standalone: true,
  imports: [
    MatFormFieldModule,
    NgClass,
    MatRippleModule,
    MatListModule,
  ],
})
export class PickerPillsComponent extends PickerPartBaseComponent {

  constructor() { super(); }

}

import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { FieldHelperTextComponent } from '../../help-text/field-help-text.component';
import { PickerPartBaseComponent } from '../picker-part-base.component';

@Component({
  standalone: true,
  selector: 'app-picker-inline-header',
  templateUrl: './picker-inline-header.component.html',
  styleUrl: './picker-inline-header.component.scss',
  imports: [
    NgClass,
    FieldHelperTextComponent,
  ],
})
export class PickerInlineHeaderComponent extends PickerPartBaseComponent {

}

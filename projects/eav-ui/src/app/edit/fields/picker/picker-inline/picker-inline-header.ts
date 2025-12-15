import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { FieldHelperTextComponent } from '../../help-text/field-help-text';
import { PickerPartBaseComponent } from '../picker-part-base';

@Component({
    selector: 'app-picker-inline-header',
    templateUrl: './picker-inline-header.html',
    styleUrl: './picker-inline-header.scss',
    imports: [
        NgClass,
        FieldHelperTextComponent,
    ]
})
export class PickerInlineHeaderComponent extends PickerPartBaseComponent {

}

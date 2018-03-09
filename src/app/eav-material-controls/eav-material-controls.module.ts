import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, ValidationErrors } from '@angular/forms';
import {
  MatFormFieldModule,
  MatButtonModule,
  MatCheckboxModule,
  MatInputModule,
  MatSelectModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatCardModule,
  MatIconModule,
} from '@angular/material';
import {
  PanelWrapperComponent,
  LabelWrapperComponent,
  CollapsibleWrapperComponent,
  HorizontalInputWrapperComponent,
  // FormFieldWrapperComponent
} from './wrappers';
import {
  StringDefaultComponent,
  StringUrlPathComponent,
  StringDropdownComponent,
  StringDropdownQueryComponent,
  StringFontIconPickerComponent,
  BooleanDefaultComponent,
  DatetimeDefaultComponent,
  EmptyDefaultComponent,
  NumberDefaultComponent
} from './input-types';
import { InputTypesConstants } from '../shared/constants';
import { CustomValidators } from './validators/custom-validators';
import { ValidationMessages } from './validators/validation-messages';
import { TextEntryWrapperComponent } from './wrappers/text-entry-wrapper/text-entry-wrapper.component';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';


@NgModule({
  declarations: [
    // wrappers
    PanelWrapperComponent,
    LabelWrapperComponent,
    CollapsibleWrapperComponent,
    HorizontalInputWrapperComponent,
    // FormFieldWrapperComponent,
    // types
    StringDefaultComponent,
    // FormFieldWrapperComponent,
    StringUrlPathComponent,
    StringDropdownComponent,
    StringDropdownQueryComponent,
    StringFontIconPickerComponent,
    BooleanDefaultComponent,
    TextEntryWrapperComponent,
    DatetimeDefaultComponent,
    EmptyDefaultComponent,
    NumberDefaultComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    MatCheckboxModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCardModule,
    MatIconModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule
  ],
  entryComponents: [
    StringDefaultComponent,
    StringUrlPathComponent,
    StringDropdownComponent,
    StringDropdownQueryComponent,
    StringFontIconPickerComponent,
    BooleanDefaultComponent,
    TextEntryWrapperComponent,
    DatetimeDefaultComponent,
    EmptyDefaultComponent,
    NumberDefaultComponent,
  ]
})
export class EavMaterialControlsModule { }

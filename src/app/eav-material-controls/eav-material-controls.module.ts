import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
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
  MatGridListModule,
  MatAutocompleteModule,
  MatListModule,
  MatMenuModule,
  MatTooltipModule,
  MatTabsModule,
  MatProgressSpinnerModule
} from '@angular/material';
import {
  CollapsibleWrapperComponent,
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
  NumberDefaultComponent,
  EntityDefaultComponent,
  HyperlinkDefaultComponent,
  ExternalComponent
} from './input-types';
import { ValidationMessagesService } from './validators/validation-messages-service';
import { TextEntryWrapperComponent } from './wrappers/text-entry-wrapper/text-entry-wrapper.component';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { ErrorWrapperComponent } from './wrappers/field-parent-wrapper/error-wrapper.component';
import { EavLocalizationComponent } from './wrappers/eav-localization-wrapper/eav-localization-wrapper.component';
import { FileTypeService } from '../shared/services/file-type.service';
import { EavLanguageSwitcherComponent } from './localization/eav-language-switcher/eav-language-switcher.component';
import { TranslateModule } from '@ngx-translate/core';
import { AdamBrowserComponent } from './adam/browser/adam-browser.component';
import { AdamHintComponent } from './adam/adam-hint/adam-hint.component';
import { DropzoneComponent } from './adam/dropzone/dropzone.component';
import { DropzoneModule } from 'ngx-dropzone-wrapper';
import { FilterPipe } from '../shared/pipes/filter.pipe';
import { OrderByPipe } from '../shared/pipes/orderby.pipe';
import { ClickStopPropagationDirective } from '../shared/directives/click-stop-propagination.directive';
import { FileEndingFilterPipe } from '../shared/pipes/file-ending-filter.pipe';

@NgModule({
  declarations: [
    // wrappers
    CollapsibleWrapperComponent,
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
    EavLocalizationComponent,
    ErrorWrapperComponent,
    EntityDefaultComponent,
    HyperlinkDefaultComponent,
    EavLanguageSwitcherComponent,
    ExternalComponent,
    AdamBrowserComponent,
    AdamHintComponent,
    DropzoneComponent,
    FilterPipe,
    OrderByPipe,
    FileEndingFilterPipe,
    ClickStopPropagationDirective
  ],
  imports: [
    CommonModule,
    DropzoneModule,
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
    OwlNativeDateTimeModule,
    MatGridListModule,
    MatAutocompleteModule,
    MatListModule,
    MatMenuModule,
    MatTooltipModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    TranslateModule.forChild()
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
    EavLocalizationComponent,
    ErrorWrapperComponent,
    CollapsibleWrapperComponent,
    EntityDefaultComponent,
    HyperlinkDefaultComponent,
    ExternalComponent,
    DropzoneComponent
  ],
  exports: [EavLanguageSwitcherComponent],
  providers: [FileTypeService, ValidationMessagesService]
})
export class EavMaterialControlsModule { }

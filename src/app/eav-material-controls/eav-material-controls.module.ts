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
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    MatChipsModule
} from '@angular/material';
import { TranslateModule } from '@ngx-translate/core';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { DropzoneModule } from 'ngx-dropzone-wrapper';

import {
    CollapsibleWrapperComponent,
    // FormFieldWrapperComponent
} from './wrappers';
import {
    BooleanDefaultComponent,
    DatetimeDefaultComponent,
    EntityDefaultComponent,
    EmptyDefaultComponent,
    ExternalComponent,
    HyperlinkDefaultComponent,
    StringDefaultComponent,
    StringUrlPathComponent,
    StringDropdownComponent,
    StringDropdownQueryComponent,
    StringFontIconPickerComponent,
    NumberDefaultComponent,
    HyperlinkDefaultPagepickerComponent
} from './input-types';
import { ValidationMessagesService } from './validators/validation-messages-service';
import { TextEntryWrapperComponent } from './wrappers/text-entry-wrapper/text-entry-wrapper.component';
import { ErrorWrapperComponent } from './wrappers/field-parent-wrapper/error-wrapper.component';
import { EavLocalizationComponent } from './wrappers/eav-localization-wrapper/eav-localization-wrapper.component';
import { FileTypeService } from '../shared/services/file-type.service';
import { EavLanguageSwitcherComponent } from './localization/eav-language-switcher/eav-language-switcher.component';
import { AdamBrowserComponent } from './adam/browser/adam-browser.component';
import { AdamHintComponent } from './adam/adam-hint/adam-hint.component';
import { DropzoneComponent } from './adam/dropzone/dropzone.component';
import { FilterPipe } from '../shared/pipes/filter.pipe';
import { OrderByPipe } from '../shared/pipes/orderby.pipe';
import { ClickStopPropagationDirective } from '../shared/directives/click-stop-propagination.directive';
import { FileEndingFilterPipe } from '../shared/pipes/file-ending-filter.pipe';
import { HyperlinkLibraryComponent } from './input-types/hyperlink/hyperlink-library/hyperlink-library.component';
import { HiddenWrapperComponent } from './wrappers/hidden-wrapper/hidden-wrapper.component';
import { WebFormBridgeDirective } from './input-types/dnn-bridge/web-form-bridge/web-form-bridge.directive';
import { DndListModule } from 'ngx-drag-and-drop-lists';

@NgModule({
    declarations: [
        // wrappers
        CollapsibleWrapperComponent,
        ErrorWrapperComponent,
        TextEntryWrapperComponent,
        // types
        StringDefaultComponent,
        StringUrlPathComponent,
        StringDropdownComponent,
        StringDropdownQueryComponent,
        StringFontIconPickerComponent,
        BooleanDefaultComponent,
        DatetimeDefaultComponent,
        EmptyDefaultComponent,
        NumberDefaultComponent,
        EavLocalizationComponent,
        EntityDefaultComponent,
        HyperlinkDefaultComponent,
        ExternalComponent,
        AdamBrowserComponent,
        AdamHintComponent,
        DropzoneComponent,
        HyperlinkLibraryComponent,
        EavLanguageSwitcherComponent,
        FilterPipe,
        OrderByPipe,
        FileEndingFilterPipe,
        ClickStopPropagationDirective,
        HiddenWrapperComponent,
        HyperlinkDefaultPagepickerComponent,
        WebFormBridgeDirective,
    ],
    imports: [
        CommonModule,
        DndListModule,
        // DndDraggable,
        DropzoneModule,
        MatAutocompleteModule,
        MatButtonModule,
        MatCardModule,
        MatCheckboxModule,
        MatChipsModule,
        MatDatepickerModule,
        MatFormFieldModule,
        MatGridListModule,
        MatIconModule,
        MatInputModule,
        MatListModule,
        MatMenuModule,
        MatNativeDateModule,
        MatProgressSpinnerModule,
        MatSelectModule,
        MatSlideToggleModule,
        MatTabsModule,
        MatTooltipModule,
        OwlDateTimeModule,
        OwlNativeDateTimeModule,
        ReactiveFormsModule,
        TranslateModule.forChild(),
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
        HyperlinkLibraryComponent,
        ExternalComponent,
        DropzoneComponent,
        HiddenWrapperComponent,
        HyperlinkDefaultPagepickerComponent
    ],
    exports: [EavLanguageSwitcherComponent],
    providers: [FileTypeService, ValidationMessagesService]
})
export class EavMaterialControlsModule { }

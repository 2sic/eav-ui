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
    MatChipsModule,
    MatDialogModule,
    MatRippleModule
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
import { FlexLayoutModule } from '@angular/flex-layout';
import { SaveStatusDialogComponent } from './dialogs/save-status-dialog/save-status-dialog.component';
import { ExpandableWrapperComponent } from './wrappers/expandable-wrapper/expandable-wrapper.component';
import { SnackBarUnsavedChangesComponent } from './dialogs/snack-bar-unsaved-changes/snack-bar-unsaved-changes.component';
import { FieldHelperTextComponent } from './wrappers/field-helper-text/field-helper-text.component';
import { TranslateGroupMenuComponent } from './localization/translate-group-menu/translate-group-menu.component';
import { LinkToOtherLanguageComponent } from './localization/link-to-other-language/link-to-other-language.component';
import { EntityExpandableWrapperComponent } from './wrappers/entity-expandable-wrapper/entity-expandable-wrapper.component';
import { EntityDefaultListComponent } from './input-types/entity/entity-default-list/entity-default-list.component';
import { EntityDefaultMainSearchComponent } from './input-types/entity/entity-default-main-search/entity-default-main-search.component';
import { EntityQueryComponent } from './input-types/entity/entity-query/entity-query.component';

@NgModule({
    declarations: [
        // wrappers
        CollapsibleWrapperComponent,
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
        SaveStatusDialogComponent,
        ExpandableWrapperComponent,
        SnackBarUnsavedChangesComponent,
        FieldHelperTextComponent,
        TranslateGroupMenuComponent,
        LinkToOtherLanguageComponent,
        EntityExpandableWrapperComponent,
        EntityDefaultListComponent,
        EntityDefaultMainSearchComponent,
        EntityQueryComponent,
    ],
    imports: [
        // DndDraggable,
        CommonModule,
        DndListModule,
        DropzoneModule,
        FlexLayoutModule,
        MatAutocompleteModule,
        MatButtonModule,
        MatCardModule,
        MatCheckboxModule,
        MatChipsModule,
        MatDatepickerModule,
        MatDialogModule,
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
        MatRippleModule,
        // FontAwesomeModule,
        TranslateModule.forChild(),
    ],
    entryComponents: [
        BooleanDefaultComponent,
        CollapsibleWrapperComponent,
        DatetimeDefaultComponent,
        DropzoneComponent,
        EavLocalizationComponent,
        EmptyDefaultComponent,
        EntityDefaultComponent,
        EntityQueryComponent,
        EntityExpandableWrapperComponent,
        ExpandableWrapperComponent,
        ExternalComponent,
        HiddenWrapperComponent,
        HyperlinkDefaultComponent,
        HyperlinkDefaultPagepickerComponent,
        HyperlinkLibraryComponent,
        NumberDefaultComponent,
        SaveStatusDialogComponent,
        SnackBarUnsavedChangesComponent,
        StringDefaultComponent,
        StringDropdownComponent,
        StringDropdownQueryComponent,
        StringFontIconPickerComponent,
        StringUrlPathComponent,
        TextEntryWrapperComponent,
        LinkToOtherLanguageComponent,
    ],
    exports: [EavLanguageSwitcherComponent],
    providers: [FileTypeService, ValidationMessagesService]
})
export class EavMaterialControlsModule { }

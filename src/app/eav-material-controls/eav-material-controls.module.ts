import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatMomentDateModule, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { OwlDateTimeModule, OwlDateTimeIntl } from 'ng-pick-datetime';
import { OwlMomentDateTimeModule, OWL_MOMENT_DATE_TIME_ADAPTER_OPTIONS } from 'ng-pick-datetime-moment';
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
    HyperlinkDefaultComponent,
    StringDefaultComponent,
    StringUrlPathComponent,
    StringDropdownComponent,
    StringDropdownQueryComponent,
    StringFontIconPickerComponent,
    NumberDefaultComponent,
    HyperlinkDefaultPagepickerComponent,
    StringTemplatePickerComponent,
} from './input-types';
import { ValidationMessagesService } from './validators/validation-messages-service';
import { TextEntryWrapperComponent } from './wrappers/text-entry-wrapper/text-entry-wrapper.component';
import { EavLocalizationComponent } from './wrappers/eav-localization-wrapper/eav-localization-wrapper.component';
import { FileTypeService } from '../shared/services/file-type.service';
import { EavLanguageSwitcherComponent } from './localization/eav-language-switcher/eav-language-switcher.component';
import { AdamBrowserComponent } from './adam/browser/adam-browser.component';
import { AdamHintComponent } from './adam/adam-hint/adam-hint.component';
import { AdamAttachWrapperComponent } from './adam/adam-attach-wrapper/adam-attach-wrapper.component';
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
import { SnackBarSaveErrorsComponent } from './dialogs/snack-bar-save-errors/snack-bar-save-errors.component';
import { FieldHelperTextComponent } from './wrappers/field-helper-text/field-helper-text.component';
import { TranslateGroupMenuComponent } from './localization/translate-group-menu/translate-group-menu.component';
import { LinkToOtherLanguageComponent } from './localization/link-to-other-language/link-to-other-language.component';
import { EntityExpandableWrapperComponent } from './wrappers/entity-expandable-wrapper/entity-expandable-wrapper.component';
import { EntityDefaultListComponent } from './input-types/entity/entity-default-list/entity-default-list.component';
import { EntityDefaultMainSearchComponent } from './input-types/entity/entity-default-main-search/entity-default-main-search.component';
import { EntityQueryComponent } from './input-types/entity/entity-query/entity-query.component';
import {
    HyperlinkDefaultExpandableWrapperComponent
} from './wrappers/hyperlink-default-expandable-wrapper/hyperlink-default-expandable-wrapper.component';
import { DropzoneWrapperComponent } from './adam/dropzone-wrapper/dropzone-wrapper.component';
import {
    HyperlinkLibraryExpandableWrapperComponent
} from './wrappers/hyperlink-library-expandable-wrapper/hyperlink-library-expandable-wrapper.component';
import { EntityContentBlockComponent } from './input-types/entity/entity-content-blocks/entity-content-blocks.component';
import { CollapsibleFieldWrapperComponent } from './wrappers/collapsible-field-wrapper/collapsible-field-wrapper.component';
import { ExternalWebComponentComponent } from './input-types/custom/external-web-component/external-web-component.component';
import { ConnectorComponent } from './input-types/custom/external-web-component/connector/connector.component';
import { CustomDefaultComponent } from './input-types/custom/custom-default/custom-default.component';
import { SafeHtmlPipe } from '../shared/pipes/safe-html';
import { OwlDateTimeIntlOverride } from './input-types/datetime/datetime-default/owl-date-time-intl-override';
import { PasteClipboardImageDirective } from '../shared/directives/upload-image.directive';

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
        StringTemplatePickerComponent,
        BooleanDefaultComponent,
        DatetimeDefaultComponent,
        EmptyDefaultComponent,
        NumberDefaultComponent,
        EavLocalizationComponent,
        EntityDefaultComponent,
        HyperlinkDefaultComponent,
        AdamBrowserComponent,
        AdamHintComponent,
        AdamAttachWrapperComponent,
        HyperlinkLibraryComponent,
        EavLanguageSwitcherComponent,
        FilterPipe,
        OrderByPipe,
        FileEndingFilterPipe,
        SafeHtmlPipe,
        ClickStopPropagationDirective,
        PasteClipboardImageDirective,
        HiddenWrapperComponent,
        HyperlinkDefaultPagepickerComponent,
        WebFormBridgeDirective,
        SaveStatusDialogComponent,
        ExpandableWrapperComponent,
        SnackBarUnsavedChangesComponent,
        SnackBarSaveErrorsComponent,
        FieldHelperTextComponent,
        TranslateGroupMenuComponent,
        LinkToOtherLanguageComponent,
        EntityExpandableWrapperComponent,
        EntityDefaultListComponent,
        EntityDefaultMainSearchComponent,
        EntityQueryComponent,
        HyperlinkDefaultExpandableWrapperComponent,
        DropzoneWrapperComponent,
        HyperlinkLibraryExpandableWrapperComponent,
        EntityContentBlockComponent,
        CollapsibleFieldWrapperComponent,
        ExternalWebComponentComponent,
        ConnectorComponent,
        CustomDefaultComponent,
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
        MatMomentDateModule,
        MatProgressSpinnerModule,
        MatSelectModule,
        MatSlideToggleModule,
        MatTabsModule,
        MatTooltipModule,
        OwlDateTimeModule,
        OwlMomentDateTimeModule,
        ReactiveFormsModule,
        MatRippleModule,
        MatChipsModule,
        // FontAwesomeModule,
        TranslateModule.forChild(),
    ],
    entryComponents: [
        BooleanDefaultComponent,
        CollapsibleWrapperComponent,
        DatetimeDefaultComponent,
        AdamAttachWrapperComponent,
        EavLocalizationComponent,
        EmptyDefaultComponent,
        EntityDefaultComponent,
        EntityQueryComponent,
        EntityExpandableWrapperComponent,
        ExpandableWrapperComponent,
        HiddenWrapperComponent,
        HyperlinkDefaultComponent,
        HyperlinkDefaultPagepickerComponent,
        HyperlinkLibraryComponent,
        NumberDefaultComponent,
        SaveStatusDialogComponent,
        SnackBarUnsavedChangesComponent,
        SnackBarSaveErrorsComponent,
        StringDefaultComponent,
        StringDropdownComponent,
        StringDropdownQueryComponent,
        StringFontIconPickerComponent,
        StringUrlPathComponent,
        StringTemplatePickerComponent,
        TextEntryWrapperComponent,
        LinkToOtherLanguageComponent,
        HyperlinkDefaultExpandableWrapperComponent,
        DropzoneWrapperComponent,
        HyperlinkLibraryExpandableWrapperComponent,
        EntityContentBlockComponent,
        CollapsibleFieldWrapperComponent,
        ExternalWebComponentComponent,
        ConnectorComponent,
        CustomDefaultComponent,
    ],
    exports: [EavLanguageSwitcherComponent],
    providers: [
        FileTypeService,
        ValidationMessagesService,
        { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
        { provide: OWL_MOMENT_DATE_TIME_ADAPTER_OPTIONS, useValue: { useUtc: true } },
        { provide: OwlDateTimeIntl, useClass: OwlDateTimeIntlOverride },
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class EavMaterialControlsModule { }

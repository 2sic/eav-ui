import { NgxMatDatetimePickerModule } from '@angular-material-components/datetime-picker';
import { NgxMatMomentModule, NGX_MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular-material-components/moment-adapter';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatMomentDateModule, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
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
import { DropzoneModule } from 'ngx-dropzone-wrapper';
import { SharedComponentsModule } from '../../ng-dialogs/src/app/shared/shared-components.module';
import { ChangeAnchorTargetDirective, PasteClipboardImageDirective } from '../shared/directives';
import { AssetsService, ScriptsLoaderService } from '../shared/services';
import { AdamAttachWrapperComponent } from './adam/adam-attach-wrapper/adam-attach-wrapper.component';
import { AdamBrowserComponent } from './adam/adam-browser/adam-browser.component';
import { AdamHintComponent } from './adam/adam-hint/adam-hint.component';
import { DropzoneWrapperComponent } from './adam/dropzone-wrapper/dropzone-wrapper.component';
import { PublishStatusDialogComponent } from './dialogs/publish-status-dialog/publish-status-dialog.component';
import { SnackBarSaveErrorsComponent } from './dialogs/snack-bar-save-errors/snack-bar-save-errors.component';
import { SnackBarUnsavedChangesComponent } from './dialogs/snack-bar-unsaved-changes/snack-bar-unsaved-changes.component';
import { BooleanDefaultComponent } from './input-types/boolean/boolean-default/boolean-default.component';
import { BooleanTristateComponent } from './input-types/boolean/boolean-tristate/boolean-tristate.component';
import { CustomDefaultComponent } from './input-types/custom/custom-default/custom-default.component';
import { CustomJsonEditorComponent } from './input-types/custom/custom-json-editor/custom-json-editor.component';
import { ConnectorComponent } from './input-types/custom/external-web-component/connector/connector.component';
import { ExternalWebComponentComponent } from './input-types/custom/external-web-component/external-web-component.component';
import { DatetimeDefaultComponent } from './input-types/datetime/datetime-default/datetime-default.component';
import { EmptyDefaultComponent } from './input-types/empty/empty-default/empty-default.component';
import { EntityContentBlockComponent } from './input-types/entity/entity-content-blocks/entity-content-blocks.component';
import { EntityDefaultListComponent } from './input-types/entity/entity-default-list/entity-default-list.component';
import { EntityDefaultSearchComponent } from './input-types/entity/entity-default-search/entity-default-search.component';
import { EntityDefaultComponent } from './input-types/entity/entity-default/entity-default.component';
import { EntityQueryComponent } from './input-types/entity/entity-query/entity-query.component';
import { HyperlinkDefaultComponent } from './input-types/hyperlink/hyperlink-default/hyperlink-default.component';
import { HyperlinkLibraryComponent } from './input-types/hyperlink/hyperlink-library/hyperlink-library.component';
import { NumberDefaultComponent } from './input-types/number/number-default/number-default.component';
import { StringDefaultComponent } from './input-types/string/string-default/string-default.component';
import { StringDropdownQueryComponent } from './input-types/string/string-dropdown-query/string-dropdown-query.component';
import { StringDropdownComponent } from './input-types/string/string-dropdown/string-dropdown.component';
import { StringFontIconPickerComponent } from './input-types/string/string-font-icon-picker/string-font-icon-picker.component';
import { StringTemplatePickerComponent } from './input-types/string/string-template-picker/string-template-picker.component';
import { StringUrlPathComponent } from './input-types/string/string-url-path/string-url-path.component';
import { EntityTranslateMenuComponent } from './localization/entity-translate-menu/entity-translate-menu.component';
import { LanguageSwitcherComponent } from './localization/language-switcher/language-switcher.component';
import { TranslateMenuDialogComponent } from './localization/translate-menu-dialog/translate-menu-dialog.component';
import { TranslateMenuComponent } from './localization/translate-menu/translate-menu.component';
import { PagePickerComponent } from './page-picker/page-picker.component';
import { CollapsibleWrapperComponent } from './wrappers';
import { EntityExpandableWrapperComponent } from './wrappers/entity-expandable-wrapper/entity-expandable-wrapper.component';
import { ExpandableWrapperComponent } from './wrappers/expandable-wrapper/expandable-wrapper.component';
import { FieldHelperTextComponent } from './wrappers/field-helper-text/field-helper-text.component';
import { HiddenWrapperComponent } from './wrappers/hidden-wrapper/hidden-wrapper.component';
import { HyperlinkDefaultExpandableWrapperComponent } from './wrappers/hyperlink-default-expandable-wrapper/hyperlink-default-expandable-wrapper.component';
import { HyperlinkLibraryExpandableWrapperComponent } from './wrappers/hyperlink-library-expandable-wrapper/hyperlink-library-expandable-wrapper.component';
import { LocalizationWrapperComponent } from './wrappers/localization-wrapper/localization-wrapper.component';

@NgModule({
  declarations: [
    CollapsibleWrapperComponent,
    StringDefaultComponent,
    StringUrlPathComponent,
    StringDropdownComponent,
    StringDropdownQueryComponent,
    StringFontIconPickerComponent,
    StringTemplatePickerComponent,
    BooleanDefaultComponent,
    BooleanTristateComponent,
    DatetimeDefaultComponent,
    EmptyDefaultComponent,
    NumberDefaultComponent,
    LocalizationWrapperComponent,
    EntityDefaultComponent,
    HyperlinkDefaultComponent,
    AdamBrowserComponent,
    AdamHintComponent,
    AdamAttachWrapperComponent,
    HyperlinkLibraryComponent,
    LanguageSwitcherComponent,
    PasteClipboardImageDirective,
    ChangeAnchorTargetDirective,
    HiddenWrapperComponent,
    PagePickerComponent,
    PublishStatusDialogComponent,
    ExpandableWrapperComponent,
    SnackBarUnsavedChangesComponent,
    SnackBarSaveErrorsComponent,
    FieldHelperTextComponent,
    EntityTranslateMenuComponent,
    TranslateMenuComponent,
    TranslateMenuDialogComponent,
    EntityExpandableWrapperComponent,
    EntityDefaultListComponent,
    EntityDefaultSearchComponent,
    EntityQueryComponent,
    HyperlinkDefaultExpandableWrapperComponent,
    DropzoneWrapperComponent,
    HyperlinkLibraryExpandableWrapperComponent,
    EntityContentBlockComponent,
    ExternalWebComponentComponent,
    ConnectorComponent,
    CustomDefaultComponent,
    CustomJsonEditorComponent,
  ],
  imports: [
    SharedComponentsModule,
    CommonModule,
    DragDropModule,
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
    NgxMatDatetimePickerModule,
    NgxMatMomentModule,
    ReactiveFormsModule,
    MatRippleModule,
    MatChipsModule,
    ScrollingModule,
    TranslateModule,
    FormsModule,
  ],
  entryComponents: [
    BooleanDefaultComponent,
    BooleanTristateComponent,
    CollapsibleWrapperComponent,
    DatetimeDefaultComponent,
    AdamAttachWrapperComponent,
    LocalizationWrapperComponent,
    EmptyDefaultComponent,
    EntityDefaultComponent,
    EntityQueryComponent,
    EntityExpandableWrapperComponent,
    ExpandableWrapperComponent,
    HiddenWrapperComponent,
    HyperlinkDefaultComponent,
    PagePickerComponent,
    HyperlinkLibraryComponent,
    NumberDefaultComponent,
    PublishStatusDialogComponent,
    SnackBarUnsavedChangesComponent,
    SnackBarSaveErrorsComponent,
    StringDefaultComponent,
    StringDropdownComponent,
    StringDropdownQueryComponent,
    StringFontIconPickerComponent,
    StringUrlPathComponent,
    StringTemplatePickerComponent,
    TranslateMenuDialogComponent,
    HyperlinkDefaultExpandableWrapperComponent,
    DropzoneWrapperComponent,
    HyperlinkLibraryExpandableWrapperComponent,
    EntityContentBlockComponent,
    ExternalWebComponentComponent,
    ConnectorComponent,
    CustomDefaultComponent,
    CustomJsonEditorComponent,
  ],
  exports: [
    LanguageSwitcherComponent,
    EntityTranslateMenuComponent,
    TranslateMenuComponent,
    ChangeAnchorTargetDirective,
  ],
  providers: [
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
    { provide: NGX_MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
    AssetsService,
    ScriptsLoaderService,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class EavMaterialControlsModule { }

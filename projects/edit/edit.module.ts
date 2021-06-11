import { NgxMatDatetimePickerModule } from '@angular-material-components/datetime-picker';
import { NgxMatMomentModule, NGX_MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular-material-components/moment-adapter';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatMomentDateModule, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { DropzoneModule } from 'ngx-dropzone-wrapper';
import { EavWindow } from '../ng-dialogs/src/app/shared/models/eav-window.model';
import { Context } from '../ng-dialogs/src/app/shared/services/context';
import { SharedComponentsModule } from '../ng-dialogs/src/app/shared/shared-components.module';
import { buildTranslateConfiguration, TranslateLoaderWithErrorHandling } from '../ng-dialogs/src/app/shared/translation';
import { EditEntryComponent } from './dialog/entry/edit-entry.component';
import { EditDialogHeaderComponent } from './dialog/header/edit-dialog-header.component';
import { ItemEditFormComponent } from './dialog/item-edit-form/item-edit-form.component';
import { DataDumpComponent } from './dialog/multi-item-edit-form-debug/data-dump/data-dump.component';
import { FormulaDesignerComponent } from './dialog/multi-item-edit-form-debug/formula-designer/formula-designer.component';
import { LogsDumpComponent } from './dialog/multi-item-edit-form-debug/logs-dump/logs-dump.component';
import { MultiItemEditFormDebugComponent } from './dialog/multi-item-edit-form-debug/multi-item-edit-form-debug.component';
import { FormSlideDirective } from './dialog/multi-item-edit-form/form-slide.directive';
import { MultiItemEditFormComponent } from './dialog/multi-item-edit-form/multi-item-edit-form.component';
import { AdamAttachWrapperComponent } from './eav-material-controls/adam/adam-attach-wrapper/adam-attach-wrapper.component';
import { AdamBrowserComponent } from './eav-material-controls/adam/adam-browser/adam-browser.component';
import { AdamHintComponent } from './eav-material-controls/adam/adam-hint/adam-hint.component';
import { AdamService } from './eav-material-controls/adam/adam.service';
import { DropzoneWrapperComponent } from './eav-material-controls/adam/dropzone-wrapper/dropzone-wrapper.component';
import { PublishStatusDialogComponent } from './eav-material-controls/dialogs/publish-status-dialog/publish-status-dialog.component';
import { SnackBarSaveErrorsComponent } from './eav-material-controls/dialogs/snack-bar-save-errors/snack-bar-save-errors.component';
import { SnackBarUnsavedChangesComponent } from './eav-material-controls/dialogs/snack-bar-unsaved-changes/snack-bar-unsaved-changes.component';
import { BooleanDefaultComponent } from './eav-material-controls/input-types/boolean/boolean-default/boolean-default.component';
import { BooleanTristateComponent } from './eav-material-controls/input-types/boolean/boolean-tristate/boolean-tristate.component';
import { CustomDefaultComponent } from './eav-material-controls/input-types/custom/custom-default/custom-default.component';
import { CustomJsonEditorComponent } from './eav-material-controls/input-types/custom/custom-json-editor/custom-json-editor.component';
import { ConnectorComponent } from './eav-material-controls/input-types/custom/external-web-component/connector/connector.component';
import { ExternalWebComponentComponent } from './eav-material-controls/input-types/custom/external-web-component/external-web-component.component';
import { DatetimeDefaultComponent } from './eav-material-controls/input-types/datetime/datetime-default/datetime-default.component';
import { EmptyDefaultComponent } from './eav-material-controls/input-types/empty/empty-default/empty-default.component';
import { EntityContentBlockComponent } from './eav-material-controls/input-types/entity/entity-content-blocks/entity-content-blocks.component';
import { EntityDefaultListComponent } from './eav-material-controls/input-types/entity/entity-default-list/entity-default-list.component';
import { EntityDefaultSearchComponent } from './eav-material-controls/input-types/entity/entity-default-search/entity-default-search.component';
import { EntityDefaultComponent } from './eav-material-controls/input-types/entity/entity-default/entity-default.component';
import { EntityQueryComponent } from './eav-material-controls/input-types/entity/entity-query/entity-query.component';
import { HyperlinkDefaultComponent } from './eav-material-controls/input-types/hyperlink/hyperlink-default/hyperlink-default.component';
import { HyperlinkLibraryComponent } from './eav-material-controls/input-types/hyperlink/hyperlink-library/hyperlink-library.component';
import { NumberDefaultComponent } from './eav-material-controls/input-types/number/number-default/number-default.component';
import { StringDefaultComponent } from './eav-material-controls/input-types/string/string-default/string-default.component';
import { StringDropdownQueryComponent } from './eav-material-controls/input-types/string/string-dropdown-query/string-dropdown-query.component';
import { StringDropdownComponent } from './eav-material-controls/input-types/string/string-dropdown/string-dropdown.component';
import { StringFontIconPickerComponent } from './eav-material-controls/input-types/string/string-font-icon-picker/string-font-icon-picker.component';
import { StringTemplatePickerComponent } from './eav-material-controls/input-types/string/string-template-picker/string-template-picker.component';
import { StringUrlPathComponent } from './eav-material-controls/input-types/string/string-url-path/string-url-path.component';
import { EntityTranslateMenuComponent } from './eav-material-controls/localization/entity-translate-menu/entity-translate-menu.component';
import { LanguageSwitcherComponent } from './eav-material-controls/localization/language-switcher/language-switcher.component';
import { TranslateMenuDialogComponent } from './eav-material-controls/localization/translate-menu-dialog/translate-menu-dialog.component';
import { TranslateMenuComponent } from './eav-material-controls/localization/translate-menu/translate-menu.component';
import { PagePickerComponent } from './eav-material-controls/page-picker/page-picker.component';
import { CollapsibleWrapperComponent } from './eav-material-controls/wrappers/collapsible-wrapper/collapsible-wrapper.component';
import { EntityExpandableWrapperComponent } from './eav-material-controls/wrappers/entity-expandable-wrapper/entity-expandable-wrapper.component';
import { ExpandableWrapperComponent } from './eav-material-controls/wrappers/expandable-wrapper/expandable-wrapper.component';
import { FieldHelperTextComponent } from './eav-material-controls/wrappers/field-helper-text/field-helper-text.component';
import { HiddenWrapperComponent } from './eav-material-controls/wrappers/hidden-wrapper/hidden-wrapper.component';
import { HyperlinkDefaultExpandableWrapperComponent } from './eav-material-controls/wrappers/hyperlink-default-expandable-wrapper/hyperlink-default-expandable-wrapper.component';
import { HyperlinkLibraryExpandableWrapperComponent } from './eav-material-controls/wrappers/hyperlink-library-expandable-wrapper/hyperlink-library-expandable-wrapper.component';
import { LocalizationWrapperComponent } from './eav-material-controls/wrappers/localization-wrapper/localization-wrapper.component';
import { EditRoutingModule } from './edit-routing.module';
import { ContentTypeWrapperComponent } from './form/components/content-type-wrapper/content-type-wrapper.component';
import { EavFieldDirective } from './form/components/eav-field/eav-field.directive';
import { EavFormComponent } from './form/components/eav-form/eav-form.component';
import { ChangeAnchorTargetDirective, PasteClipboardImageDirective } from './shared/directives';
import { AssetsService, EavService, EntityService, LoadIconsService, QueryService, ScriptsLoaderService } from './shared/services';

declare const window: EavWindow;

// AoT requires an exported function for factories
// at least according to https://github.com/ngx-translate/http-loader
export function translateLoaderFactoryEdit(http: HttpClient): TranslateLoader {
  return new TranslateLoaderWithErrorHandling(http, './i18n/', `.js?${window.sxcVersion}`);
}

@NgModule({
  declarations: [
    EditEntryComponent,
    MultiItemEditFormComponent,
    ItemEditFormComponent,
    EditDialogHeaderComponent,
    MultiItemEditFormDebugComponent,
    DataDumpComponent,
    FormulaDesignerComponent,
    LogsDumpComponent,
    FormSlideDirective,
    EavFieldDirective,
    EavFormComponent,
    ContentTypeWrapperComponent,
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
    EditRoutingModule,
    SharedComponentsModule,
    CommonModule,
    TranslateModule.forChild(buildTranslateConfiguration(translateLoaderFactoryEdit)),
    RouterModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatMomentDateModule,
    MatCardModule,
    MatIconModule,
    MatMenuModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatDialogModule,
    MatDividerModule,
    FlexLayoutModule,
    FormsModule,
    MatFormFieldModule,
    MatSlideToggleModule,
    DragDropModule,
    DropzoneModule,
    MatAutocompleteModule,
    MatListModule,
    MatProgressSpinnerModule,
    NgxMatDatetimePickerModule,
    NgxMatMomentModule,
    MatRippleModule,
    ScrollingModule,
  ],
  providers: [
    Context,
    EavService,
    AdamService,
    EntityService,
    QueryService,
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
    { provide: NGX_MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
    LoadIconsService,
    AssetsService,
    ScriptsLoaderService,
  ],
})
export class EditModule { }

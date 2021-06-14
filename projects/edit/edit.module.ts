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
import { DataDumpComponent } from './dialog/footer/data-dump/data-dump.component';
import { EditDialogFooterComponent } from './dialog/footer/edit-dialog-footer.component';
import { FormulaDesignerComponent } from './dialog/footer/formula-designer/formula-designer.component';
import { LogsDumpComponent } from './dialog/footer/logs-dump/logs-dump.component';
import { EditDialogHeaderComponent } from './dialog/header/edit-dialog-header.component';
import { LanguageSwitcherComponent } from './dialog/header/language-switcher/language-switcher.component';
import { PublishStatusDialogComponent } from './dialog/header/publish-status-dialog/publish-status-dialog.component';
import { EditDialogMainComponent } from './dialog/main/edit-dialog-main.component';
import { FormSlideDirective } from './dialog/main/form-slide.directive';
import { SnackBarSaveErrorsComponent } from './dialog/main/snack-bar-save-errors/snack-bar-save-errors.component';
import { SnackBarUnsavedChangesComponent } from './dialog/main/snack-bar-unsaved-changes/snack-bar-unsaved-changes.component';
import { EditRoutingModule } from './edit-routing.module';
import { ContentTypeWrapperComponent } from './form/builder/content-type-wrapper/content-type-wrapper.component';
import { EntityTranslateMenuComponent } from './form/builder/content-type-wrapper/entity-translate-menu/entity-translate-menu.component';
import { EavFieldDirective } from './form/builder/eav-field/eav-field.directive';
import { EavFormComponent } from './form/builder/eav-form/eav-form.component';
import { BooleanDefaultComponent } from './form/fields/boolean/boolean-default/boolean-default.component';
import { BooleanTristateComponent } from './form/fields/boolean/boolean-tristate/boolean-tristate.component';
import { CustomDefaultComponent } from './form/fields/custom/custom-default/custom-default.component';
import { CustomJsonEditorComponent } from './form/fields/custom/custom-json-editor/custom-json-editor.component';
import { ExternalWebComponentComponent } from './form/fields/custom/external-web-component/external-web-component.component';
import { DatetimeDefaultComponent } from './form/fields/datetime/datetime-default/datetime-default.component';
import { EmptyDefaultComponent } from './form/fields/empty/empty-default/empty-default.component';
import { EntityContentBlockComponent } from './form/fields/entity/entity-content-blocks/entity-content-blocks.component';
import { EntityDefaultListComponent } from './form/fields/entity/entity-default/entity-default-list/entity-default-list.component';
import { EntityDefaultSearchComponent } from './form/fields/entity/entity-default/entity-default-search/entity-default-search.component';
import { EntityDefaultComponent } from './form/fields/entity/entity-default/entity-default.component';
import { EntityQueryComponent } from './form/fields/entity/entity-query/entity-query.component';
import { HyperlinkDefaultComponent } from './form/fields/hyperlink/hyperlink-default/hyperlink-default.component';
import { HyperlinkLibraryComponent } from './form/fields/hyperlink/hyperlink-library/hyperlink-library.component';
import { NumberDefaultComponent } from './form/fields/number/number-default/number-default.component';
import { StringDefaultComponent } from './form/fields/string/string-default/string-default.component';
import { StringDropdownQueryComponent } from './form/fields/string/string-dropdown-query/string-dropdown-query.component';
import { StringDropdownComponent } from './form/fields/string/string-dropdown/string-dropdown.component';
import { StringFontIconPickerComponent } from './form/fields/string/string-font-icon-picker/string-font-icon-picker.component';
import { StringTemplatePickerComponent } from './form/fields/string/string-template-picker/string-template-picker.component';
import { StringUrlPathComponent } from './form/fields/string/string-url-path/string-url-path.component';
import { ConnectorComponent } from './form/shared/connector/connector.component';
import { FieldHelperTextComponent } from './form/shared/field-helper-text/field-helper-text.component';
import { PagePickerComponent } from './form/shared/page-picker/page-picker.component';
import { AdamAttachWrapperComponent } from './form/wrappers/adam-attach-wrapper/adam-attach-wrapper.component';
import { AdamBrowserComponent } from './form/wrappers/adam-attach-wrapper/adam-browser/adam-browser.component';
import { AdamHintComponent } from './form/wrappers/adam-attach-wrapper/adam-hint/adam-hint.component';
import { CollapsibleWrapperComponent } from './form/wrappers/collapsible-wrapper/collapsible-wrapper.component';
import { DropzoneWrapperComponent } from './form/wrappers/dropzone-wrapper/dropzone-wrapper.component';
import { EntityExpandableWrapperComponent } from './form/wrappers/entity-expandable-wrapper/entity-expandable-wrapper.component';
import { ExpandableWrapperComponent } from './form/wrappers/expandable-wrapper/expandable-wrapper.component';
import { HiddenWrapperComponent } from './form/wrappers/hidden-wrapper/hidden-wrapper.component';
import { HyperlinkDefaultExpandableWrapperComponent } from './form/wrappers/hyperlink-default-expandable-wrapper/hyperlink-default-expandable-wrapper.component';
import { HyperlinkLibraryExpandableWrapperComponent } from './form/wrappers/hyperlink-library-expandable-wrapper/hyperlink-library-expandable-wrapper.component';
import { LocalizationWrapperComponent } from './form/wrappers/localization-wrapper/localization-wrapper.component';
import { TranslateMenuDialogComponent } from './form/wrappers/localization-wrapper/translate-menu-dialog/translate-menu-dialog.component';
import { TranslateMenuComponent } from './form/wrappers/localization-wrapper/translate-menu/translate-menu.component';
import { ChangeAnchorTargetDirective, PasteClipboardImageDirective } from './shared/directives';
import { AdamService, AssetsService, EavService, EntityService, LoadIconsService, QueryService, ScriptsLoaderService } from './shared/services';

declare const window: EavWindow;

// AoT requires an exported function for factories
// at least according to https://github.com/ngx-translate/http-loader
export function translateLoaderFactoryEdit(http: HttpClient): TranslateLoader {
  return new TranslateLoaderWithErrorHandling(http, './i18n/', `.js?${window.sxcVersion}`);
}

@NgModule({
  declarations: [
    EditEntryComponent,
    EditDialogMainComponent,
    EditDialogHeaderComponent,
    EditDialogFooterComponent,
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

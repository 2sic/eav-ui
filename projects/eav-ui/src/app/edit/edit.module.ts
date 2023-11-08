import { NgxMatDatetimePickerModule } from '@angular-material-components/datetime-picker';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MAT_SELECT_CONFIG, MatSelectModule } from '@angular/material/select';
import { MAT_SLIDE_TOGGLE_DEFAULT_OPTIONS, MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTreeModule } from '@angular/material/tree';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Dayjs } from 'dayjs';
import { DropzoneModule } from 'ngx-dropzone-wrapper';
import { SourceService } from '../code-editor/services/source.service';
import { EntitiesService } from '../content-items/services/entities.service';
import { CreateFileDialogModule } from '../create-file-dialog';
import { FeaturesModule } from '../features/features.module';
import { MonacoEditorModule } from '../monaco-editor';
import { ExtendedFabSpeedDialModule } from '../shared/modules/extended-fab-speed-dial/extended-fab-speed-dial.module';
import { Context } from '../shared/services/context';
import { SharedComponentsModule } from '../shared/shared-components.module';
import { buildTranslateConfiguration } from '../shared/translation';
import { translateLoaderFactory } from '../shared/translation/translate-loader-factory';
import { EditEntryComponent } from './dialog/entry/edit-entry.component';
import { DataDumpComponent } from './dialog/footer/data-dump/data-dump.component';
import { EditDialogFooterComponent } from './dialog/footer/edit-dialog-footer.component';
import { FormulaDesignerComponent } from './dialog/footer/formula-designer/formula-designer.component';
import { SnippetLabelSizePipe } from './dialog/footer/formula-designer/snippet-label-size.pipe';
import { LogsDumpComponent } from './dialog/footer/logs-dump/logs-dump.component';
import { EditDialogHeaderComponent } from './dialog/header/edit-dialog-header.component';
import { LanguageSwitcherComponent } from './dialog/header/language-switcher/language-switcher.component';
import { PublishStatusDialogComponent } from './dialog/header/publish-status-dialog/publish-status-dialog.component';
import { EditDialogMainComponent } from './dialog/main/edit-dialog-main.component';
import { FormSlideDirective } from './dialog/main/form-slide.directive';
import { SnackBarSaveErrorsComponent } from './dialog/main/snack-bar-save-errors/snack-bar-save-errors.component';
import { SnackBarUnsavedChangesComponent } from './dialog/main/snack-bar-unsaved-changes/snack-bar-unsaved-changes.component';
import { EditRoutingModule } from './edit-routing.module';
import { EntityTranslateMenuComponent } from './form/builder/entity-wrapper/entity-translate-menu/entity-translate-menu.component';
import { EntityWrapperComponent } from './form/builder/entity-wrapper/entity-wrapper.component';
import { FieldsBuilderDirective } from './form/builder/fields-builder/fields-builder.directive';
import { FormBuilderComponent } from './form/builder/form-builder/form-builder.component';
import { BooleanDefaultComponent } from './form/fields/boolean/boolean-default/boolean-default.component';
import { BooleanTristateComponent } from './form/fields/boolean/boolean-tristate/boolean-tristate.component';
import { CustomDefaultComponent } from './form/fields/custom/custom-default/custom-default.component';
import { CustomJsonEditorComponent } from './form/fields/custom/custom-json-editor/custom-json-editor.component';
import { ExternalWebComponentComponent } from './form/fields/custom/external-web-component/external-web-component.component';
import { DatetimeDefaultComponent } from './form/fields/datetime/datetime-default/datetime-default.component';
import { EmptyDefaultComponent } from './form/fields/empty/empty-default/empty-default.component';
import { EmptyMessageComponent } from './form/fields/empty/empty-message/empty-message.component';
import { EntityContentBlockComponent } from './form/fields/entity/entity-content-blocks/entity-content-blocks.component';
import { EntityDefaultComponent } from './form/fields/entity/entity-default/entity-default.component';
import { EntityQueryComponent } from './form/fields/entity/entity-query/entity-query.component';
import { HyperlinkDefaultComponent } from './form/fields/hyperlink/hyperlink-default/hyperlink-default.component';
import { HyperlinkLibraryComponent } from './form/fields/hyperlink/hyperlink-library/hyperlink-library.component';
import { NumberDefaultComponent } from './form/fields/number/number-default/number-default.component';
import { NumberDropdownComponent } from './form/fields/number/number-dropdown/number-dropdown.component';
import { PickerListComponent } from './form/fields/picker/picker-list/picker-list.component';
import { PickerSearchComponent } from './form/fields/picker/picker-search/picker-search.component';
import { PickerSourceAdapterFactoryService } from './form/fields/picker/picker-source-adapter-factory.service';
import { PickerStateAdapterFactoryService } from './form/fields/picker/picker-state-adapter-factory.service';
import { PickerComponent } from './form/fields/picker/picker.component';
import { StringDefaultComponent } from './form/fields/string/string-default/string-default.component';
import { StringDropdownQueryComponent } from './form/fields/string/string-dropdown-query/string-dropdown-query.component';
import { StringDropdownComponent } from './form/fields/string/string-dropdown/string-dropdown.component';
import { StringFontIconPickerComponent } from './form/fields/string/string-font-icon-picker/string-font-icon-picker.component';
import { StringTemplatePickerComponent } from './form/fields/string/string-template-picker/string-template-picker.component';
import { StringUrlPathComponent } from './form/fields/string/string-url-path/string-url-path.component';
import { ConnectorComponent } from './form/shared/connector/connector.component';
import { FieldHelperTextComponent } from './form/shared/field-helper-text/field-helper-text.component';
import { PagePickerComponent } from './form/shared/page-picker/page-picker.component';
import { AdamBrowserComponent } from './form/wrappers/adam-wrapper/adam-browser/adam-browser.component';
import { AdamHintComponent } from './form/wrappers/adam-wrapper/adam-hint/adam-hint.component';
import { AdamWrapperComponent } from './form/wrappers/adam-wrapper/adam-wrapper.component';
import { CollapsibleWrapperComponent } from './form/wrappers/collapsible-wrapper/collapsible-wrapper.component';
import { DropzoneWrapperComponent } from './form/wrappers/dropzone-wrapper/dropzone-wrapper.component';
import { ExpandableWrapperComponent } from './form/wrappers/expandable-wrapper/expandable-wrapper.component';
import { HiddenWrapperComponent } from './form/wrappers/hidden-wrapper/hidden-wrapper.component';
import { HyperlinkDefaultExpandableWrapperComponent } from './form/wrappers/hyperlink-default-expandable-wrapper/hyperlink-default-expandable-wrapper.component';
import { HyperlinkLibraryExpandableWrapperComponent } from './form/wrappers/hyperlink-library-expandable-wrapper/hyperlink-library-expandable-wrapper.component';
import { AutoTranslateDisabledWarningDialog } from './form/wrappers/localization-wrapper/auto-translate-disabled-warning-dialog/auto-translate-disabled-warning-dialog.component';
import { AutoTranslateMenuDialogComponent } from './form/wrappers/localization-wrapper/auto-translate-menu-dialog/auto-translate-menu-dialog.component';
import { LocalizationWrapperComponent } from './form/wrappers/localization-wrapper/localization-wrapper.component';
import { SnackBarWarningDemoComponent } from './form/wrappers/localization-wrapper/snack-bar-warning-demo/snack-bar-warning-demo.component';
import { TranslateMenuDialogComponent } from './form/wrappers/localization-wrapper/translate-menu-dialog/translate-menu-dialog.component';
import { TranslateMenuComponent } from './form/wrappers/localization-wrapper/translate-menu/translate-menu.component';
import { PickerExpandableWrapperComponent } from './form/wrappers/picker-expandable-wrapper/picker-expandable-wrapper.component';
// tslint:disable-next-line: max-line-length
import { MatDayjsDateAdapter, MatDayjsDateModule, MatDayjsModule, MAT_DAYJS_DATE_ADAPTER_OPTIONS, NgxMatDayjsDatetimeAdapter, NgxMatDayjsDatetimeModule, NgxMatDayjsModule, NGX_MAT_DAYJS_DATETIME_ADAPTER_OPTIONS } from './shared/date-adapters/date-adapter-api';
import { ChangeAnchorTargetDirective, PasteClipboardImageDirective } from './shared/directives';
import { AdamService, EavService, EntityService, LoadIconsService, QueryService, ScriptsLoaderService } from './shared/services';
import { PickerPillPreviewComponent } from './form/fields/picker/picker-pill-preview/picker-pill-preview.component';
import { PickerTextComponent } from './form/fields/picker/picker-text/picker-text.component';
import { PickerDialogComponent } from './form/fields/picker/picker-dialog/picker-dialog.component';
import { PickerPreviewComponent } from './form/fields/picker/picker-preview/picker-preview.component';
import { PickerTextToggleComponent } from './form/fields/picker/picker-text-toggle/picker-text-toggle.component';
import { FieldDataSourceFactoryService } from './form/fields/picker/field-data-source-factory.service';
import { EntityPickerComponent } from './form/fields/entity/entity-picker/entity-picker.component';

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
        FieldsBuilderDirective,
        FormBuilderComponent,
        EntityWrapperComponent,
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
        PickerComponent,
        HyperlinkDefaultComponent,
        AdamBrowserComponent,
        AdamHintComponent,
        AdamWrapperComponent,
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
        SnackBarWarningDemoComponent,
        FieldHelperTextComponent,
        EntityTranslateMenuComponent,
        TranslateMenuComponent,
        TranslateMenuDialogComponent,
        AutoTranslateMenuDialogComponent,
        AutoTranslateDisabledWarningDialog,
        PickerExpandableWrapperComponent,
        PickerListComponent,
        PickerSearchComponent,
        PickerDialogComponent,
        PickerPreviewComponent,
        PickerTextComponent,
        PickerTextToggleComponent,
        PickerPillPreviewComponent,
        EntityQueryComponent,
        EntityDefaultComponent,
        HyperlinkDefaultExpandableWrapperComponent,
        DropzoneWrapperComponent,
        HyperlinkLibraryExpandableWrapperComponent,
        EntityContentBlockComponent,
        ExternalWebComponentComponent,
        ConnectorComponent,
        CustomDefaultComponent,
        CustomJsonEditorComponent,
        NumberDropdownComponent,
        EmptyMessageComponent,
        SnippetLabelSizePipe,
        EntityPickerComponent,
    ],
    imports: [
        EditRoutingModule,
        SharedComponentsModule,
        CommonModule,
        TranslateModule.forChild(buildTranslateConfiguration(translateLoaderFactory)),
        RouterModule,
        MatButtonModule,
        MatInputModule,
        MatSelectModule,
        ReactiveFormsModule,
        MatDatepickerModule,
        MatDayjsDateModule,
        MatDayjsModule,
        NgxMatDayjsDatetimeModule,
        NgxMatDayjsModule,
        MatCardModule,
        MatIconModule,
        MatMenuModule,
        MatSnackBarModule,
        MatDialogModule,
        MatDividerModule,
        MatBadgeModule,
        MatTreeModule,
        FormsModule,
        MatFormFieldModule,
        MatSlideToggleModule,
        DragDropModule,
        DropzoneModule,
        MatAutocompleteModule,
        MatListModule,
        MatProgressSpinnerModule,
        NgxMatDatetimePickerModule,
        MatRippleModule,
        ScrollingModule,
        MonacoEditorModule,
        CreateFileDialogModule,
        ExtendedFabSpeedDialModule,
        FeaturesModule,
        FlexLayoutModule,
    ],
    providers: [
        Context,
        EavService,
        AdamService,
        EntityService,
        QueryService,
        MatDayjsDateAdapter,
        { provide: MAT_DAYJS_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
        NgxMatDayjsDatetimeAdapter,
        { provide: NGX_MAT_DAYJS_DATETIME_ADAPTER_OPTIONS, useValue: { useUtc: true } },
        LoadIconsService,
        SourceService,
        ScriptsLoaderService,
        EntitiesService,
        { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { subscriptSizing: 'dynamic' } },
        { provide: MAT_SELECT_CONFIG, useValue: { hideSingleSelectionIndicator: true } },
        { provide: MAT_SLIDE_TOGGLE_DEFAULT_OPTIONS, useValue: { hideIcon: true } },
        PickerSourceAdapterFactoryService,
        PickerStateAdapterFactoryService,
        FieldDataSourceFactoryService,
    ],
})
export class EditModule { }

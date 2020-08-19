import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatMomentDateModule, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { NgxMatDatetimePickerModule } from '@angular-material-components/datetime-picker';
import { NgxMatMomentModule, NGX_MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular-material-components/moment-adapter';
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
import { FlexLayoutModule } from '@angular/flex-layout';
import { TranslateModule } from '@ngx-translate/core';
import { DropzoneModule } from 'ngx-dropzone-wrapper';

import { CollapsibleWrapperComponent } from './wrappers';
import {
  BooleanDefaultComponent,
  BooleanTristateComponent,
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
  PagepickerComponent,
  StringTemplatePickerComponent,
} from './input-types';
import { ValidationMessagesService } from './validators/validation-messages-service';
import { EavLocalizationComponent } from './wrappers/eav-localization-wrapper/eav-localization-wrapper.component';
import { FileTypeService } from '../shared/services/file-type.service';
import { EavLanguageSwitcherComponent } from './localization/eav-language-switcher/eav-language-switcher.component';
import { AdamBrowserComponent } from './adam/adam-browser/adam-browser.component';
import { AdamHintComponent } from './adam/adam-hint/adam-hint.component';
import { AdamAttachWrapperComponent } from './adam/adam-attach-wrapper/adam-attach-wrapper.component';
import { HyperlinkLibraryComponent } from './input-types/hyperlink/hyperlink-library/hyperlink-library.component';
import { HiddenWrapperComponent } from './wrappers/hidden-wrapper/hidden-wrapper.component';
import { WebFormBridgeDirective } from './input-types/dnn-bridge/web-form-bridge/web-form-bridge.directive';
import { SaveStatusDialogComponent } from './dialogs/save-status-dialog/save-status-dialog.component';
import { ExpandableWrapperComponent } from './wrappers/expandable-wrapper/expandable-wrapper.component';
import { SnackBarUnsavedChangesComponent } from './dialogs/snack-bar-unsaved-changes/snack-bar-unsaved-changes.component';
import { SnackBarSaveErrorsComponent } from './dialogs/snack-bar-save-errors/snack-bar-save-errors.component';
import { FieldHelperTextComponent } from './wrappers/field-helper-text/field-helper-text.component';
import { TranslateGroupMenuComponent } from './localization/translate-group-menu/translate-group-menu.component';
import { LinkToOtherLanguageComponent } from './localization/link-to-other-language/link-to-other-language.component';
import { EntityExpandableWrapperComponent } from './wrappers/entity-expandable-wrapper/entity-expandable-wrapper.component';
import { EntityDefaultListComponent } from './input-types/entity/entity-default-list/entity-default-list.component';
import { EntityDefaultSearchComponent } from './input-types/entity/entity-default-search/entity-default-search.component';
import { EntityQueryComponent } from './input-types/entity/entity-query/entity-query.component';
// tslint:disable-next-line:max-line-length
import { HyperlinkDefaultExpandableWrapperComponent } from './wrappers/hyperlink-default-expandable-wrapper/hyperlink-default-expandable-wrapper.component';
import { DropzoneWrapperComponent } from './adam/dropzone-wrapper/dropzone-wrapper.component';
// tslint:disable-next-line:max-line-length
import { HyperlinkLibraryExpandableWrapperComponent } from './wrappers/hyperlink-library-expandable-wrapper/hyperlink-library-expandable-wrapper.component';
import { EntityContentBlockComponent } from './input-types/entity/entity-content-blocks/entity-content-blocks.component';
import { CollapsibleFieldWrapperComponent } from './wrappers/collapsible-field-wrapper/collapsible-field-wrapper.component';
import { ExternalWebComponentComponent } from './input-types/custom/external-web-component/external-web-component.component';
import { ConnectorComponent } from './input-types/custom/external-web-component/connector/connector.component';
import { CustomDefaultComponent } from './input-types/custom/custom-default/custom-default.component';
import { PasteClipboardImageDirective } from '../shared/directives/paste-clipboard-image.directive';
import { ChangeAnchorTargetDirective } from '../shared/directives/change-anchor-target.directive';
import { SharedComponentsModule } from '../../ng-dialogs/src/app/shared/shared-components.module';
import { AssetsService } from '../shared/services/assets.service';
import { ScriptsLoaderService } from '../shared/services/scripts-loader.service';
import { CustomJsonEditorComponent } from './input-types/custom/custom-json-editor/custom-json-editor.component';

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
    EavLocalizationComponent,
    EntityDefaultComponent,
    HyperlinkDefaultComponent,
    AdamBrowserComponent,
    AdamHintComponent,
    AdamAttachWrapperComponent,
    HyperlinkLibraryComponent,
    EavLanguageSwitcherComponent,
    PasteClipboardImageDirective,
    ChangeAnchorTargetDirective,
    HiddenWrapperComponent,
    PagepickerComponent,
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
    EntityDefaultSearchComponent,
    EntityQueryComponent,
    HyperlinkDefaultExpandableWrapperComponent,
    DropzoneWrapperComponent,
    HyperlinkLibraryExpandableWrapperComponent,
    EntityContentBlockComponent,
    CollapsibleFieldWrapperComponent,
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
  ],
  entryComponents: [
    BooleanDefaultComponent,
    BooleanTristateComponent,
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
    PagepickerComponent,
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
    LinkToOtherLanguageComponent,
    HyperlinkDefaultExpandableWrapperComponent,
    DropzoneWrapperComponent,
    HyperlinkLibraryExpandableWrapperComponent,
    EntityContentBlockComponent,
    CollapsibleFieldWrapperComponent,
    ExternalWebComponentComponent,
    ConnectorComponent,
    CustomDefaultComponent,
    CustomJsonEditorComponent,
  ],
  exports: [EavLanguageSwitcherComponent],
  providers: [
    FileTypeService,
    ValidationMessagesService,
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
    { provide: NGX_MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
    AssetsService,
    ScriptsLoaderService,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class EavMaterialControlsModule { }

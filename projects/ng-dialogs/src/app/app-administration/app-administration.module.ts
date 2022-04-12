import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRippleModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { ZoneService } from '../apps-management/services/zone.service';
import { SourceService } from '../code-editor/services/source.service';
import { ContentExportService } from '../content-export/services/content-export.service';
import { ContentItemsService } from '../content-items/services/content-items.service';
import { ContentTypesFieldsService } from '../content-type-fields/services/content-types-fields.service';
import { CreateFileDialogModule } from '../create-file-dialog';
import { MetadataService } from '../permissions';
import { SxcGridModule } from '../shared/modules/sxc-grid-module/sxc-grid.module';
import { Context } from '../shared/services/context';
import { DialogService } from '../shared/services/dialog.service';
import { SharedComponentsModule } from '../shared/shared-components.module';
import { AnalyzeSettingsKeyComponent } from './ag-grid-components/analyze-settings-key/analyze-settings-key.component';
import { AnalyzeSettingsTotalResultsComponent } from './ag-grid-components/analyze-settings-total-results/analyze-settings-total-results.component';
import { AnalyzeSettingsValueComponent } from './ag-grid-components/analyze-settings-value/analyze-settings-value.component';
import { DataActionsComponent } from './ag-grid-components/data-actions/data-actions.component';
import { DataFieldsComponent } from './ag-grid-components/data-fields/data-fields.component';
import { DataItemsComponent } from './ag-grid-components/data-items/data-items.component';
import { LanguagesPermissionsActionsComponent } from './ag-grid-components/languages-permissions-actions/languages-permissions-actions.component';
import { QueriesActionsComponent } from './ag-grid-components/queries-actions/queries-actions.component';
import { ViewsActionsComponent } from './ag-grid-components/views-actions/views-actions.component';
import { ViewsShowComponent } from './ag-grid-components/views-show/views-show.component';
import { ViewsTypeComponent } from './ag-grid-components/views-type/views-type.component';
import { ViewsUsageIdComponent } from './ag-grid-components/views-usage-id/views-usage-id.component';
import { ViewsUsageStatusFilterComponent } from './ag-grid-components/views-usage-status-filter/views-usage-status-filter.component';
import { WebApiActionsComponent } from './ag-grid-components/web-api-actions/web-api-actions.component';
import { WebApiTypeComponent } from './ag-grid-components/web-api-type/web-api-type.component';
import { AppAdministrationNavComponent } from './app-administration-nav/app-administration-nav.component';
import { AppAdministrationRoutingModule } from './app-administration-routing.module';
import { AppConfigurationComponent } from './app-configuration/app-configuration.component';
import { DataComponent } from './data/data.component';
import { GettingStartedComponent } from './getting-started/getting-started.component';
import { QueriesComponent } from './queries/queries.component';
import { AnalyzeSettingsService } from './services/analyze-settings.service';
import { AppDialogConfigService } from './services/app-dialog-config.service';
import { ContentTypesService } from './services/content-types.service';
import { ExportAppPartsService } from './services/export-app-parts.service';
import { ExportAppService } from './services/export-app.service';
import { ImportAppPartsService } from './services/import-app-parts.service';
import { PipelinesService } from './services/pipelines.service';
import { ViewsService } from './services/views.service';
import { AnalyzeSettingsComponent } from './sub-dialogs/analyze-settings/analyze-settings.component';
import { SettingsItemDetailsComponent } from './sub-dialogs/analyze-settings/settings-item-details/settings-item-details.component';
import { EditContentTypeComponent } from './sub-dialogs/edit-content-type/edit-content-type.component';
import { ExportAppPartsComponent } from './sub-dialogs/export-app-parts/export-app-parts.component';
import { ExportAppComponent } from './sub-dialogs/export-app/export-app.component';
import { ImportAppPartsComponent } from './sub-dialogs/import-app-parts/import-app-parts.component';
import { ImportContentTypeComponent } from './sub-dialogs/import-content-type/import-content-type.component';
import { ImportQueryComponent } from './sub-dialogs/import-query/import-query.component';
import { ImportViewComponent } from './sub-dialogs/import-view/import-view.component';
import { LanguagePermissionsComponent } from './sub-dialogs/language-permissions/language-permissions.component';
import { ViewsUsageComponent } from './sub-dialogs/views-usage/views-usage.component';
import { ViewsComponent } from './views/views.component';
import { WebApiComponent } from './web-api/web-api.component';

@NgModule({
  declarations: [
    GettingStartedComponent,
    AppAdministrationNavComponent,
    DataComponent,
    QueriesComponent,
    ViewsComponent,
    WebApiComponent,
    AppConfigurationComponent,
    DataItemsComponent,
    DataFieldsComponent,
    DataActionsComponent,
    QueriesActionsComponent,
    ViewsTypeComponent,
    ViewsShowComponent,
    ViewsActionsComponent,
    EditContentTypeComponent,
    ImportQueryComponent,
    ExportAppComponent,
    ExportAppPartsComponent,
    ImportAppPartsComponent,
    WebApiActionsComponent,
    ViewsUsageComponent,
    ViewsUsageIdComponent,
    ViewsUsageStatusFilterComponent,
    ImportContentTypeComponent,
    ImportViewComponent,
    AnalyzeSettingsComponent,
    AnalyzeSettingsKeyComponent,
    AnalyzeSettingsValueComponent,
    AnalyzeSettingsTotalResultsComponent,
    SettingsItemDetailsComponent,
    LanguagePermissionsComponent,
    LanguagesPermissionsActionsComponent,
    WebApiTypeComponent,
  ],
  imports: [
    AppAdministrationRoutingModule,
    SharedComponentsModule,
    MatDialogModule,
    CommonModule,
    MatButtonModule,
    MatIconModule,
    SxcGridModule,
    MatTabsModule,
    FormsModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatCardModule,
    MatRippleModule,
    MatSnackBarModule,
    MatMenuModule,
    MatBadgeModule,
    CreateFileDialogModule,
  ],
  providers: [
    Context,
    AppDialogConfigService,
    ContentTypesService,
    PipelinesService,
    ViewsService,
    ContentExportService,
    SourceService,
    ContentItemsService,
    ExportAppService,
    ExportAppPartsService,
    ImportAppPartsService,
    DialogService,
    AnalyzeSettingsService,
    ContentTypesFieldsService,
    MetadataService,
    ZoneService,
  ],
})
export class AppAdministrationModule { }

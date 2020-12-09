import { AgGridModule } from '@ag-grid-community/angular';
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
import { MatTooltipModule } from '@angular/material/tooltip';
import { EcoFabSpeedDialModule } from '@ecodev/fab-speed-dial';
import { AppsListService } from '../apps-management/services/apps-list.service';
import { ContentExportService } from '../content-export/services/content-export.service';
import { ContentItemsService } from '../content-items/services/content-items.service';
import { Context } from '../shared/services/context';
import { DialogService } from '../shared/services/dialog.service';
import { SharedComponentsModule } from '../shared/shared-components.module';
import { DataActionsComponent } from './ag-grid-components/data-actions/data-actions.component';
import { DataFieldsComponent } from './ag-grid-components/data-fields/data-fields.component';
import { DataItemsComponent } from './ag-grid-components/data-items/data-items.component';
import { QueriesActionsComponent } from './ag-grid-components/queries-actions/queries-actions.component';
import { ViewsActionsComponent } from './ag-grid-components/views-actions/views-actions.component';
import { ViewsShowComponent } from './ag-grid-components/views-show/views-show.component';
import { ViewsTypeComponent } from './ag-grid-components/views-type/views-type.component';
import { ViewsUsageIdComponent } from './ag-grid-components/views-usage-id/views-usage-id.component';
import { ViewsUsageStatusFilterComponent } from './ag-grid-components/views-usage-status-filter/views-usage-status-filter.component';
import { WebApiActionsComponent } from './ag-grid-components/web-api-actions/web-api-actions.component';
import { AppAdministrationNavComponent } from './app-administration-nav/app-administration-nav.component';
import { AppAdministrationRoutingModule } from './app-administration-routing.module';
import { AppConfigurationComponent } from './app-configuration/app-configuration.component';
import { DataComponent } from './data/data.component';
import { GettingStartedComponent } from './getting-started/getting-started.component';
import { QueriesComponent } from './queries/queries.component';
import { AppDialogConfigService } from './services/app-dialog-config.service';
import { ContentTypesService } from './services/content-types.service';
import { ExportAppPartsService } from './services/export-app-parts.service';
import { ExportAppService } from './services/export-app.service';
import { ImportAppPartsService } from './services/import-app-parts.service';
import { PipelinesService } from './services/pipelines.service';
import { ViewsService } from './services/views.service';
import { WebApisService } from './services/web-apis.service';
import { EditContentTypeComponent } from './sub-dialogs/edit-content-type/edit-content-type.component';
import { ExportAppPartsComponent } from './sub-dialogs/export-app-parts/export-app-parts.component';
import { ExportAppComponent } from './sub-dialogs/export-app/export-app.component';
import { ImportAppPartsComponent } from './sub-dialogs/import-app-parts/import-app-parts.component';
import { ImportContentTypeComponent } from './sub-dialogs/import-content-type/import-content-type.component';
import { ImportQueryComponent } from './sub-dialogs/import-query/import-query.component';
import { ImportViewComponent } from './sub-dialogs/import-view/import-view.component';
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
  ],
  entryComponents: [
    AppAdministrationNavComponent,
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
  ],
  imports: [
    AppAdministrationRoutingModule,
    SharedComponentsModule,
    MatDialogModule,
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    AgGridModule.withComponents([]),
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
    EcoFabSpeedDialModule,
    MatSnackBarModule,
    MatMenuModule,
    MatBadgeModule,
  ],
  providers: [
    Context,
    AppDialogConfigService,
    ContentTypesService,
    PipelinesService,
    ViewsService,
    ContentExportService,
    WebApisService,
    ContentItemsService,
    ExportAppService,
    ExportAppPartsService,
    ImportAppPartsService,
    DialogService,
    AppsListService,
  ]
})
export class AppAdministrationModule { }

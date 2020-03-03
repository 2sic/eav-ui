import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridModule } from '@ag-grid-community/angular';
import { FormsModule } from '@angular/forms';

// material components
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatDialogModule } from '@angular/material/dialog';

import { AppAdministrationNavComponent } from './app-administration-nav/app-administration-nav.component';
import { GettingStartedComponent } from './getting-started/getting-started.component';
import { DataComponent } from './data/data.component';
import { QueriesComponent } from './queries/queries.component';
import { ViewsComponent } from './views/views.component';
import { WebApiComponent } from './web-api/web-api.component';
import { AppConfigurationComponent } from './app-configuration/app-configuration.component';
import { Context } from '../shared/context/context';
import { AppAdministrationRoutingModule } from './app-administration-routing.module';
import { SharedComponentsModule } from '../shared/components/shared-components.module';
import { DataNameComponent } from './shared/ag-grid-components/data-name/data-name.component';
import { DataFieldsComponent } from './shared/ag-grid-components/data-fields/data-fields.component';
import { DataActionsComponent } from './shared/ag-grid-components/data-actions/data-actions.component';
import { QueriesDescriptionComponent } from './shared/ag-grid-components/queries-description/queries-description.component';
import { ViewsShowComponent } from './shared/ag-grid-components/views-show/views-show.component';
import { ViewsActionsComponent } from './shared/ag-grid-components/views-actions/views-actions.component';
import { AppDialogConfigService } from './shared/services/app-dialog-config.service';
import { ContentTypesService } from './shared/services/content-types.service';
import { PipelinesService } from './shared/services/pipelines.service';
import { TemplatesService } from './shared/services/templates.service';
import { EditContentTypeComponent } from './shared/modals/edit-content-type/edit-content-type.component';
import { ContentExportComponent } from './shared/modals/content-export/content-export.component';
import { ContentExportService } from './shared/services/content-export.service';
import { ContentImportComponent } from './shared/modals/content-import/content-import.component';
import { ContentImportService } from './shared/services/content-import.service';
import { PermissionsComponent } from './shared/modals/permissions/permissions.component';
import { PermissionsService } from './shared/services/permissions.service';
import { MetadataService } from './shared/services/metadata.service';
import { PermissionsGrantComponent } from './shared/ag-grid-components/permissions-grant/permissions-grant.component';
import { EntitiesService } from './shared/services/entities.service';
import { ContentTypeFieldsComponent } from './shared/modals/content-type-fields/content-type-fields.component';
import { ContentTypesFieldsService } from './shared/services/content-types-fields.service';
import { EditContentTypeFieldsComponent } from './shared/modals/edit-content-type-fields/edit-content-type-fields.component';
import { ImportQueryComponent } from './shared/modals/import-query/import-query.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { WebApisService } from './shared/services/web-apis.service';
import { ContentItemsComponent } from './shared/modals/content-items/content-items.component';
import { ContentItemsService } from './shared/services/content-items.service';
import { ContentItemImportComponent } from './shared/modals/content-item-import/content-item-import.component';
import { PubMetaFilterComponent } from '../shared/ag-grid-filters/pub-meta-filter/pub-meta-filter.component';
import { ExportAppComponent } from './shared/modals/export-app/export-app.component';
import { ExportAppPartsComponent } from './shared/modals/export-app-parts/export-app-parts.component';
import { ImportAppPartsComponent } from './shared/modals/import-app-parts/import-app-parts.component';

@NgModule({
  declarations: [
    GettingStartedComponent,
    AppAdministrationNavComponent,
    DataComponent,
    QueriesComponent,
    ViewsComponent,
    WebApiComponent,
    AppConfigurationComponent,
    DataNameComponent,
    DataFieldsComponent,
    DataActionsComponent,
    QueriesDescriptionComponent,
    ViewsShowComponent,
    ViewsActionsComponent,
    EditContentTypeComponent,
    ContentExportComponent,
    ContentImportComponent,
    PermissionsComponent,
    PermissionsGrantComponent,
    ContentTypeFieldsComponent,
    EditContentTypeFieldsComponent,
    ImportQueryComponent,
    ContentItemsComponent,
    ContentItemImportComponent,
    PubMetaFilterComponent,
    ExportAppComponent,
    ExportAppPartsComponent,
    ImportAppPartsComponent,
  ],
  entryComponents: [
    AppAdministrationNavComponent,
    DataNameComponent,
    DataFieldsComponent,
    DataActionsComponent,
    QueriesDescriptionComponent,
    ViewsShowComponent,
    ViewsActionsComponent,
    EditContentTypeComponent,
    ContentExportComponent,
    ContentImportComponent,
    PermissionsComponent,
    PermissionsGrantComponent,
    ContentTypeFieldsComponent,
    EditContentTypeFieldsComponent,
    ImportQueryComponent,
    ContentItemsComponent,
    ContentItemImportComponent,
    PubMetaFilterComponent,
    ExportAppComponent,
    ExportAppPartsComponent,
    ImportAppPartsComponent,
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
  ],
  providers: [
    Context,
    AppDialogConfigService,
    ContentTypesService,
    PipelinesService,
    TemplatesService,
    ContentExportService,
    ContentImportService,
    PermissionsService,
    MetadataService,
    EntitiesService,
    ContentTypesFieldsService,
    WebApisService,
    ContentItemsService,
  ]
})
export class AppAdministrationModule { }

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
import { GlobalSettingsComponent } from './global-settings/global-settings.component';
import { AppAdministrationEntryComponent } from './app-administration-entry/app-administration-entry.component';
import { AppAdministrationTabPickerComponent } from './app-administration-tab-picker/app-administration-tab-picker.component';
import { AppAdministrationParamsService } from './shared/services/app-administration-params.service';
import { Context } from '../shared/context/context';
import { AppAdministrationRoutingModule } from './app-administration-routing.module';
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
import { EavConfigurationService } from './shared/services/eav-configuration.service';
import { ContentExportComponent } from './shared/modals/content-export/content-export.component';
import { ContentExportService } from './shared/services/content-export.service';
import { ContentImportComponent } from './shared/modals/content-import/content-import.component';
import { ContentImportService } from './shared/services/content-import.service';
import { PermissionsComponent } from './shared/modals/permissions/permissions.component';
import { PermissionsService } from './shared/services/permissions.service';
import { MetadataService } from './shared/services/metadata.service';
import { PermissionsGrantComponent } from './shared/ag-grid-components/permissions-grant/permissions-grant.component';
import { EntitiesService } from './shared/services/entities.service';
import { EditFieldsComponent } from './shared/modals/edit-fields/edit-fields.component';
import { ContentTypesFieldsService } from './shared/services/content-types-fields.service';

@NgModule({
  declarations: [
    GettingStartedComponent,
    AppAdministrationNavComponent,
    DataComponent,
    QueriesComponent,
    ViewsComponent,
    WebApiComponent,
    AppConfigurationComponent,
    GlobalSettingsComponent,
    AppAdministrationEntryComponent,
    AppAdministrationTabPickerComponent,
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
    EditFieldsComponent,
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
    EditFieldsComponent,
  ],
  imports: [
    AppAdministrationRoutingModule,
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
  ],
  providers: [
    AppAdministrationParamsService,
    Context,
    AppDialogConfigService,
    ContentTypesService,
    PipelinesService,
    TemplatesService,
    EavConfigurationService,
    ContentExportService,
    ContentImportService,
    PermissionsService,
    MetadataService,
    EntitiesService,
    ContentTypesFieldsService,
  ]
})
export class AppAdministrationModule { }

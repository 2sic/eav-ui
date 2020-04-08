import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridModule } from '@ag-grid-community/angular';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCardModule } from '@angular/material/card';
import { MatRippleModule } from '@angular/material/core';

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
import { DataItemsComponent } from './shared/ag-grid-components/data-items/data-items.component';
import { DataFieldsComponent } from './shared/ag-grid-components/data-fields/data-fields.component';
import { DataActionsComponent } from './shared/ag-grid-components/data-actions/data-actions.component';
import { QueriesActionsComponent } from './shared/ag-grid-components/queries-actions/queries-actions.component';
import { ViewsShowComponent } from './shared/ag-grid-components/views-show/views-show.component';
import { ViewsActionsComponent } from './shared/ag-grid-components/views-actions/views-actions.component';
import { AppDialogConfigService } from './shared/services/app-dialog-config.service';
import { ContentTypesService } from './shared/services/content-types.service';
import { PipelinesService } from './shared/services/pipelines.service';
import { TemplatesService } from './shared/services/templates.service';
import { EditContentTypeComponent } from './shared/modals/edit-content-type/edit-content-type.component';
import { ContentExportService } from './shared/services/content-export.service';
import { ContentImportComponent } from './shared/modals/content-import/content-import.component';
import { ContentImportService } from './shared/services/content-import.service';
import { ImportQueryComponent } from './shared/modals/import-query/import-query.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { WebApisService } from './shared/services/web-apis.service';
import { ContentItemsService } from '../content-items/services/content-items.service';
import { ExportAppComponent } from './shared/modals/export-app/export-app.component';
import { ExportAppPartsComponent } from './shared/modals/export-app-parts/export-app-parts.component';
import { ImportAppPartsComponent } from './shared/modals/import-app-parts/import-app-parts.component';
import { ExportAppService } from './shared/services/export-app.service';
import { ExportAppPartsService } from './shared/services/export-app-parts.service';
import { ImportAppPartsService } from './shared/services/import-app-parts.service';

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
    ViewsShowComponent,
    ViewsActionsComponent,
    EditContentTypeComponent,
    ContentImportComponent,
    ImportQueryComponent,
    ExportAppComponent,
    ExportAppPartsComponent,
    ImportAppPartsComponent,
  ],
  entryComponents: [
    AppAdministrationNavComponent,
    DataItemsComponent,
    DataFieldsComponent,
    DataActionsComponent,
    QueriesActionsComponent,
    ViewsShowComponent,
    ViewsActionsComponent,
    EditContentTypeComponent,
    ContentImportComponent,
    ImportQueryComponent,
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
    MatCheckboxModule,
    MatExpansionModule,
    MatCardModule,
    MatRippleModule,
  ],
  providers: [
    Context,
    AppDialogConfigService,
    ContentTypesService,
    PipelinesService,
    TemplatesService,
    ContentExportService,
    ContentImportService,
    WebApisService,
    ContentItemsService,
    ExportAppService,
    ExportAppPartsService,
    ImportAppPartsService,
  ]
})
export class AppAdministrationModule { }

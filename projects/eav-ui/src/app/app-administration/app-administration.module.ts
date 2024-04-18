import { NgModule } from '@angular/core';
import { ZoneService } from '../apps-management/services/zone.service';
import { SourceService } from '../code-editor/services/source.service';
import { ContentExportService } from '../content-export/services/content-export.service';
import { ContentItemsService } from '../content-items/services/content-items.service';
import { ContentTypesFieldsService } from '../content-type-fields/services/content-types-fields.service';
import { MetadataService } from '../permissions';
import { Context } from '../shared/services/context';
import { DialogService } from '../shared/services/dialog.service';
import { AppAdministrationRoutingModule } from './app-administration-routing.module';
import { AnalyzeSettingsService } from './services/analyze-settings.service';
import { AppDialogConfigService } from './services/app-dialog-config.service';
import { AppInternalsService } from './services/app-internals.service';
import { ContentTypesService } from './services/content-types.service';
import { ExportAppPartsService } from './services/export-app-parts.service';
import { ExportAppService } from './services/export-app.service';
import { ImportAppPartsService } from './services/import-app-parts.service';
import { PipelinesService } from './services/pipelines.service';
import { ViewsService } from './services/views.service';
import { ExportAppPartsComponent } from './sub-dialogs/export-app-parts/export-app-parts.component';
import { ExportAppComponent } from './sub-dialogs/export-app/export-app.component';
import { ImportAppPartsComponent } from './sub-dialogs/import-app-parts/import-app-parts.component';

@NgModule({
  imports: [
    AppAdministrationRoutingModule,
    ExportAppComponent,
    ExportAppPartsComponent,
    ImportAppPartsComponent,
  ],
  providers: [
    Context,
    AppDialogConfigService,
    AppInternalsService,
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
    // @2dg, no impact of style since angular 16+
    // { provide: MAT_SELECT_CONFIG, useValue: { hideSingleSelectionIndicator: true } },
    // { provide: MAT_SLIDE_TOGGLE_DEFAULT_OPTIONS, useValue: { hideIcon: true } }
  ],
})
export class AppAdministrationModule { }

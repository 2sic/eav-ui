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
import { AppDialogConfigService } from './services/app-dialog-config.service';
import { AppInternalsService } from './services/app-internals.service';
import { ContentTypesService } from './services/content-types.service';
import { ExportAppPartsService } from './services/export-app-parts.service';
import { ExportAppService } from './services/export-app.service';
import { ImportAppPartsService } from './services/import-app-parts.service';
import { PipelinesService } from './services/pipelines.service';
import { ExportAppPartsComponent } from './sub-dialogs/export-app-parts/export-app-parts.component';

@NgModule({
  imports: [
    // TODO:: @2dg Fix later, AppId from Context ist not correct, if remove the following components
    // Important: If one of these two components is in the module, Managed Apps > App administration works.
    // In other words, the Eav service has the correct context app ID, not from the app where the Apps Manage is opened,
    // e.g. AppId 2 = Content App but from the app that is opened in the Managed, e.g. AppId 6 = Blog
    AppAdministrationRoutingModule,
    // ImportAppPartsComponent
    ExportAppPartsComponent
  ],
  providers: [
    Context,
    AppDialogConfigService,
    AppInternalsService,
    ContentTypesService,
    PipelinesService,
    ContentExportService,
    SourceService,
    ContentItemsService,
    ExportAppService,
    ExportAppPartsService,
    ImportAppPartsService,
    DialogService,
    ContentTypesFieldsService,
    MetadataService,
    ZoneService,
    
    // 2024-07-02 2dm disabled / moved to correct component only
    // ViewsService,
    // AnalyzeSettingsService,
  ],
})
export class AppAdministrationModule { }

import { NgModule } from '@angular/core';
import { ContentTypesService } from '../app-administration/services/content-types.service';
import { ContentExportService } from '../content-export/services/content-export.service';
import { SxcGridModule } from '../shared/modules/sxc-grid-module/sxc-grid.module';
import { Context } from '../shared/services/context';
import { ContentItemsRoutingModule } from './content-items-routing.module';
import { ContentItemsComponent } from './content-items.component';
import { ContentItemsService } from './services/content-items.service';
import { EntitiesService } from './services/entities.service';
import { FeatureDetailService } from '../features/services/feature-detail.service';
@NgModule({
  imports: [
    SxcGridModule,
    ContentItemsRoutingModule,
    ContentItemsComponent,
  ],
  providers: [
    Context,
    ContentItemsService,
    EntitiesService,
    ContentExportService,
    ContentTypesService,
    // @2dg, no impact of style since angular 16+
    // { provide: MAT_SELECT_CONFIG, useValue: { hideSingleSelectionIndicator: true } },
    // { provide: MAT_SLIDE_TOGGLE_DEFAULT_OPTIONS, useValue: { hideIcon: true } }
  ],
})
export class ContentItemsModule { }

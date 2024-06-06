import { NgModule } from '@angular/core';
import { ContentTypesService } from '../app-administration/services/content-types.service';
import { SxcGridModule } from '../shared/modules/sxc-grid-module/sxc-grid.module';
import { Context } from '../shared/services/context';
import { ContentTypeFieldsRoutingModule } from './content-type-fields-routing.module';
import { ContentTypesFieldsService } from './services/content-types-fields.service';
import { TranslateModule } from '@ngx-translate/core';
import { FeaturesModule } from '../features/features.module';
import { ContentItemsService } from '../content-items/services/content-items.service';
@NgModule({
  imports: [
    ContentTypeFieldsRoutingModule,
    SxcGridModule,
    TranslateModule,
    FeaturesModule,
  ],
  providers: [
    Context,
    ContentTypesService,
    ContentTypesFieldsService,
    ContentItemsService,
    // @2dg, no impact of style since angular 16+
    // { provide: MAT_SELECT_CONFIG, useValue: { hideSingleSelectionIndicator: true } },
  ]
})
export class ContentTypeFieldsModule { }

import { NgModule } from '@angular/core';
import { ContentTypesService } from '../app-administration/services/content-types.service';
import { MetadataService } from '../permissions/services/metadata.service';
import { Context } from '../shared/services/context';
import { QueryDefinitionService } from './services/query-definition.service';
import { VisualQueryRoutingModule } from './visual-query-routing.module';
@NgModule({
  imports: [
    VisualQueryRoutingModule,
  ],
  providers: [
    QueryDefinitionService,
    MetadataService,
    ContentTypesService,
    Context,
    // @2dg, no impact of style since angular 16+
    // { provide: MAT_SELECT_CONFIG, useValue: { hideSingleSelectionIndicator: true } },
    // { provide: MAT_SLIDE_TOGGLE_DEFAULT_OPTIONS, useValue: { hideIcon: true } }
    // @2dg Check, if this is needed
    // { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { subscriptSizing: 'dynamic' } },
  ],
})
export class VisualQueryModule { }

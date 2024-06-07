
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SourceService } from '../code-editor/services/source.service';
import { EntitiesService } from '../content-items/services/entities.service';
import { Context } from '../shared/services/context';
import { EditEntryComponent } from './dialog/entry/edit-entry.component';
import { EditRoutingModule } from './edit-routing.module';
import { AdamService, EavService, EntityService, LoadIconsService, QueryService, ScriptsLoaderService } from './shared/services';
import { MatDayjsDateAdapter } from './shared/date-adapters/date-adapter-api';



@NgModule({
  imports: [
    // TODO:: Fix later, AppId from Context ist not correct, if remove the following component EditEntryComponent,
    // Managed Apps > Light Speed open the false App

    EditEntryComponent,
    EditRoutingModule,
    RouterModule,
    // @2dg New in app.Module, remove after Test
    // TranslateModule.forChild(buildTranslateConfiguration(translateLoaderFactory)),

  ],
  providers: [
    Context,

    EavService,
    AdamService,
    EntityService,
    QueryService,
    LoadIconsService,
    SourceService,
    ScriptsLoaderService,
    EntitiesService,

    MatDayjsDateAdapter,

    // @2dg, move in to dateTime component
    // { provide: MAT_DAYJS_DATE_ADAPTER_OPTIONS, useValue: { useUtc: false } },
    // { provide: OWL_DATE_TIME_FORMATS, useValue: OWL_DAYJS_FORMATS },
    // { provide: OWL_DAYJS_DATE_TIME_ADAPTER_OPTIONS, useValue: { useUtc: true } },

    // @2dg, no impact of style since angular 16+
    // { provide: MAT_SELECT_CONFIG, useValue: { hideSingleSelectionIndicator: true } },
    // { provide: MAT_SLIDE_TOGGLE_DEFAULT_OPTIONS, useValue: { hideIcon: true } }
    // { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { subscriptSizing: 'dynamic' } },
  ],
})
export class EditModule { }

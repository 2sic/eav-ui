
import { NgModule } from '@angular/core';
import { EditRoutes } from './edit.routing';
import { RouterModule } from '@angular/router';

console.log('2dm test');

@NgModule({
  imports: [
    // TODO:: Fix later, AppId from Context ist not correct, if remove the following component EditEntryComponent,
    // Managed Apps > Light Speed open the false App
    // EditEntryComponent,
    RouterModule.forChild(EditRoutes),
    // EditRoutingModule,

    // 2dm- I think this doesn't have an effect, since it's already referenced in EditRoutingModule
    // RouterModule,
    // @2dg New in app.Module, remove after Test
    // TranslateModule.forChild(buildTranslateConfiguration(translateLoaderFactory)),
  ],
  // exports: [
  //   RouterModule,
  // ],
  providers: [

    // Context,              // Form context, such as what app etc. - the same for the entire form
    // FormConfigService,    // form configuration valid for this entire form; will be initialized by the EditInitializerService

      // Context,
    // FormConfigService,

    // AdamService,

    // 2dm - moved to entry component
    // EntityService,
    // QueryService,

    // 2dm - moved to edit-dialog-main-component which is the only place it's used in...
    // LoadIconsService,

    // 2dm - I don't think this is ever used in the edit-module
    // SourceService,

    // @2dg note from 2dm - this must be unique per edit form - moved to edit-entry
    // ScriptsLoaderService,

    // this seems to be needed by the formula designer and metadata services - moved to formula only
    // EntitiesService,

    // MatDayjsDateAdapter,

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

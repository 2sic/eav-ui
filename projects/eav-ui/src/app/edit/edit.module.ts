
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SourceService } from '../code-editor/services/source.service';
import { EntitiesService } from '../content-items/services/entities.service';
import { Context } from '../shared/services/context';
import { buildTranslateConfiguration } from '../shared/translation';
import { translateLoaderFactory } from '../shared/translation/translate-loader-factory';
import { EditEntryComponent } from './dialog/entry/edit-entry.component';
import { EditRoutingModule } from './edit-routing.module';
import { AdamService, EavService, EntityService, LoadIconsService, QueryService, ScriptsLoaderService } from './shared/services';

// const OWL_DAYJS_FORMATS = {
//   parseInput: 'l LT',
//   fullPickerInput: 'l LT',
//   datePickerInput: 'l',
//   timePickerInput: 'LT',
//   monthYearLabel: 'MMM YYYY',
//   dateA11yLabel: 'LL',
//   monthYearA11yLabel: 'MMMM YYYY',
// };

@NgModule({
  imports: [
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

    // @2dg, move in to dateTime component
    // MatDayjsDateAdapter,
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

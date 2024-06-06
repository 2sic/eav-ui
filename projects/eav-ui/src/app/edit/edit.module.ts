
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SourceService } from '../code-editor/services/source.service';
import { EntitiesService } from '../content-items/services/entities.service';
import { Context } from '../shared/services/context';
import { EditEntryComponent } from './dialog/entry/edit-entry.component';
import { EditRoutingModule } from './edit-routing.module';
import { AdamService, EavService, EntityService, LoadIconsService, QueryService, ScriptsLoaderService } from './shared/services';
import { PickerPillsComponent } from './form/fields/picker/picker-pills/picker-pills.component';
import { PickerTextComponent } from './form/fields/picker/picker-text/picker-text.component';
import { PickerDialogComponent } from './form/fields/picker/picker-dialog/picker-dialog.component';
import { PickerPreviewComponent } from './form/fields/picker/picker-preview/picker-preview.component';
import { PickerTextToggleComponent } from './form/fields/picker/picker-text-toggle/picker-text-toggle.component';
import { EntityPickerComponent } from './form/fields/entity/entity-picker/entity-picker.component';
import { StringPickerComponent } from './form/fields/string/string-picker/string-picker.component';
import { OWL_DATE_TIME_FORMATS, OwlDateTimeModule } from '@danielmoncada/angular-datetime-picker';
import { OWL_DAYJS_DATE_TIME_ADAPTER_OPTIONS, OwlDayJsDateTimeModule } from '@danielmoncada/angular-datetime-picker-dayjs-adapter';
import { PickerIconHelpComponent } from './form/fields/picker/picker-icon-help/picker-icon-help.component';
import { PickerIconInfoComponent } from './form/fields/picker/picker-icon-info/picker-icon-info.component';
import { PickerTreeComponent } from './form/fields/picker/picker-tree/picker-tree.component';
import { PickerTreeDataService } from './form/fields/picker/picker-tree/picker-tree-data-service';
import { PickerTreeDataHelper } from './form/fields/picker/picker-tree/picker-tree-data-helper';
import { MatDayjsDateAdapter } from './shared/date-adapters/date-adapter-api';



@NgModule({
  imports: [
    EditRoutingModule,
    RouterModule,

    // @2dg Remove after Test
    // EditEntryComponent,
    // @2dg New in app.Module, remove after Test
    // TranslateModule.forChild(buildTranslateConfiguration(translateLoaderFactory)),

  ],
  providers: [
    Context,
    // @2dg Remove after Test
    // EavService,
    // AdamService,
    // EntityService,
    // QueryService,
    // LoadIconsService,
    // SourceService,
    // ScriptsLoaderService,
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

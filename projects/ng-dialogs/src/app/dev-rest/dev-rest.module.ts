import { AgGridModule } from '@ag-grid-community/angular';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HelpPopupComponent, SelectorWithHelpComponent } from '.';
import { EavService, EntityService } from '../../../../edit/shared/services';
import { PipelinesService } from '../app-administration/services';
import { AppDialogConfigService } from '../app-administration/services/app-dialog-config.service';
import { ContentTypesService } from '../app-administration/services/content-types.service';
import { EntitiesService } from '../content-items/services/entities.service';
import { MetadataService } from '../permissions/services/metadata.service';
import { PermissionsService } from '../permissions/services/permissions.service';
import { Context } from '../shared/services/context';
import { SharedComponentsModule } from '../shared/shared-components.module';
import { DevRestApiComponent } from './api/api.component';
import { DevRestDataComponent } from './data/data.component';
import { DevRestEntryComponent } from './entry/entry.component';
import { DevRestQueryIntroductionComponent } from './query/introduction/introduction.component';
import { DevRestQueryComponent } from './query/query.component';
import { DevRestRoutingModule } from './dev-rest-routing.module';
import { DevRestTabExamplesComponent } from './tab-examples/tab-examples.component';
import { DevRestHttpHeadersComponent } from './tab-headers/tab-headers.component';
import { DevRestTabIntroductionComponent } from './tab-introduction/tab-introduction.component';
import { DevRestTabPermissionsComponent } from './tab-permissions/tab-permissions.component';
import { DevRestUrlsAndCodeComponent } from './dev-rest-urls-and-code/dev-rest-urls-and-code.component';
import { InfoBoxComponent } from './info-box/info-box.component';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { DevRestDataIntroductionComponent } from './data/introduction/introduction.component';
import { DevRestApiIntroductionComponent } from './api/introduction/introduction.component';
import { DevRestApiActionParamsComponent } from './api/action-params/action-params.component';
import { TrueFalseComponent } from './api/action-params/true-false.component';
import { DevRestApiPermissionsComponent } from './api/permissions/permissions.component';

@NgModule({
  declarations: [
    DevRestEntryComponent,

    InfoBoxComponent,
    DevRestUrlsAndCodeComponent,
    SelectorWithHelpComponent,
    HelpPopupComponent,
    DevRestHttpHeadersComponent,
    DevRestTabPermissionsComponent,
    DevRestTabIntroductionComponent,
    DevRestTabExamplesComponent,

    // Data
    DevRestDataComponent,
    DevRestDataIntroductionComponent,

    // Query
    DevRestQueryComponent,
    DevRestQueryIntroductionComponent,

    // Custom WebAPIs
    DevRestApiComponent,
    DevRestApiIntroductionComponent,
    DevRestApiActionParamsComponent,
    TrueFalseComponent,
    DevRestApiPermissionsComponent,
  ],
  entryComponents: [
    DevRestDataComponent,
    SelectorWithHelpComponent,
    HelpPopupComponent,
    DevRestQueryComponent,
    DevRestEntryComponent,
    DevRestApiComponent,
  ],
  imports: [
    CommonModule,
    DevRestRoutingModule,
    SharedComponentsModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTabsModule,
    MatListModule,
    MatIconModule,
    MatExpansionModule,
    AgGridModule.withComponents([]),
    MatBadgeModule,
  ],
  providers: [
    Context,
    ContentTypesService,
    AppDialogConfigService,
    PermissionsService,
    MetadataService,
    EntitiesService,
    EntityService,
    PipelinesService,
    EavService,
  ]
})
export class DevRestModule { }

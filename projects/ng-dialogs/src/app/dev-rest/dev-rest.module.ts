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
import { DevRestCustomComponent } from './dev-rest-custom/dev-rest-custom.component';
import { DevRestDataComponent } from './dev-rest-data/dev-rest-data.component';
import { DevRestEntryComponent } from './dev-rest-entry/dev-rest-entry.component';
import { DevRestQueryIntroductionComponent } from './dev-rest-query/introduction/introduction.component';
import { DevRestQueryComponent } from './dev-rest-query/dev-rest-query.component';
import { DevRestRoutingModule } from './dev-rest-routing.module';
import { DevRestTabExamplesComponent } from './dev-rest-tab-examples/dev-rest-tab-examples.component';
import { DevRestHttpHeadersComponent } from './dev-rest-tab-headers/dev-rest-tab-headers.component';
import { DevRestTabIntroductionComponent } from './dev-rest-tab-introduction/dev-rest-tab-introduction.component';
import { DevRestTabPermissionsComponent } from './dev-rest-tab-permissions/dev-rest-tab-permissions.component';
import { DevRestUrlsAndCodeComponent } from './dev-rest-urls-and-code/dev-rest-urls-and-code.component';
import { InfoBoxComponent } from './info-box/info-box.component';

@NgModule({
  declarations: [
    InfoBoxComponent,
    DevRestTabExamplesComponent,
    DevRestUrlsAndCodeComponent,
    DevRestDataComponent,
    SelectorWithHelpComponent,
    HelpPopupComponent,
    DevRestHttpHeadersComponent,
    DevRestTabPermissionsComponent,
    DevRestTabIntroductionComponent,
    DevRestTabExamplesComponent,
    DevRestQueryComponent,
    DevRestEntryComponent,
    DevRestCustomComponent,

    // Query
    DevRestQueryIntroductionComponent,
  ],
  entryComponents: [
    DevRestDataComponent,
    SelectorWithHelpComponent,
    HelpPopupComponent,
    DevRestQueryComponent,
    DevRestEntryComponent,
    DevRestCustomComponent,
  ],
  imports: [
    CommonModule,
    DevRestRoutingModule,
    SharedComponentsModule,
    MatDialogModule,
    MatButtonModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatFormFieldModule,
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

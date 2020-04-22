import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRippleModule } from '@angular/material/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AgGridModule } from '@ag-grid-community/angular';
import { EcoFabSpeedDialModule } from '@ecodev/fab-speed-dial';

import { ContentItemsRoutingModule } from './content-items-routing.module';
import { ContentItemsComponent } from './content-items.component';
import { PubMetaFilterComponent } from './ag-grid-components/pub-meta-filter/pub-meta-filter.component';
import { ContentItemsStatusComponent } from './ag-grid-components/content-items-status/content-items-status.component';
import { ContentItemsActionsComponent } from './ag-grid-components/content-items-actions/content-items-actions.component';
import { ContentItemsEntityComponent } from './ag-grid-components/content-items-entity/content-items-entity.component';
import { ContentItemImportComponent } from './ag-grid-components/content-item-import/content-item-import.component';
import { SharedComponentsModule } from '../shared/shared-components.module';
import { Context } from '../shared/context/context';
import { ContentItemsService } from './services/content-items.service';
import { EntitiesService } from './services/entities.service';
import { ContentExportService } from '../app-administration/shared/services/content-export.service';

@NgModule({
  declarations: [
    ContentItemsComponent,
    PubMetaFilterComponent,
    ContentItemsStatusComponent,
    ContentItemsActionsComponent,
    ContentItemsEntityComponent,
    ContentItemImportComponent,
  ],
  entryComponents: [
    ContentItemsComponent,
    PubMetaFilterComponent,
    ContentItemsStatusComponent,
    ContentItemsActionsComponent,
    ContentItemsEntityComponent,
    ContentItemImportComponent,
  ],
  imports: [
    CommonModule,
    ContentItemsRoutingModule,
    SharedComponentsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    AgGridModule.withComponents([]),
    FormsModule,
    MatRadioModule,
    MatTooltipModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatRippleModule,
    MatSnackBarModule,
    EcoFabSpeedDialModule,
  ],
  providers: [
    Context,
    ContentItemsService,
    EntitiesService,
    ContentExportService,
  ]
})
export class ContentItemsModule { }

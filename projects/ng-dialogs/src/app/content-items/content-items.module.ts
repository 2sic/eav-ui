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
import { AgGridModule } from '@ag-grid-community/angular';

import { ContentItemsRoutingModule } from './content-items-routing.module';
import { ContentItemsComponent } from './content-items.component';
import { PubMetaFilterComponent } from './pub-meta-filter/pub-meta-filter.component';
import { ContentItemsIdComponent } from './content-items-id/content-items-id.component';
import { ContentItemsStatusComponent } from './content-items-status/content-items-status.component';
import { ContentItemsActionsComponent } from './content-items-actions/content-items-actions.component';
import { ContentItemsEntityComponent } from './content-items-entity/content-items-entity.component';
import { ContentItemImportComponent } from './content-item-import/content-item-import.component';
import { SharedComponentsModule } from '../shared/components/shared-components.module';
import { Context } from '../shared/context/context';
import { ContentItemsService } from './services/content-items.service';
import { EntitiesService } from './services/entities.service';
import { ContentExportService } from '../app-administration/shared/services/content-export.service';

@NgModule({
  declarations: [
    ContentItemsComponent,
    PubMetaFilterComponent,
    ContentItemsIdComponent,
    ContentItemsStatusComponent,
    ContentItemsActionsComponent,
    ContentItemsEntityComponent,
    ContentItemImportComponent,
  ],
  entryComponents: [
    ContentItemsComponent,
    PubMetaFilterComponent,
    ContentItemsIdComponent,
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
  ],
  providers: [
    Context,
    ContentItemsService,
    EntitiesService,
    ContentExportService,
  ]
})
export class ContentItemsModule { }

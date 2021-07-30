import { AgGridModule } from '@ag-grid-community/angular';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { EcoFabSpeedDialModule } from '@ecodev/fab-speed-dial';
import { ContentTypesService } from '../app-administration/services/content-types.service';
import { ContentExportService } from '../content-export/services/content-export.service';
import { Context } from '../shared/services/context';
import { SharedComponentsModule } from '../shared/shared-components.module';
import { ContentItemsActionsComponent } from './ag-grid-components/content-items-actions/content-items-actions.component';
import { ContentItemsEntityComponent } from './ag-grid-components/content-items-entity/content-items-entity.component';
import { ContentItemsStatusComponent } from './ag-grid-components/content-items-status/content-items-status.component';
import { PubMetaFilterComponent } from './ag-grid-components/pub-meta-filter/pub-meta-filter.component';
import { ContentItemImportComponent } from './content-item-import/content-item-import.component';
import { ContentItemsRoutingModule } from './content-items-routing.module';
import { ContentItemsComponent } from './content-items.component';
import { CreateMetadataDialogComponent } from './create-metadata-dialog/create-metadata-dialog.component';
import { ContentItemsService } from './services/content-items.service';
import { EntitiesService } from './services/entities.service';

@NgModule({
  declarations: [
    ContentItemsComponent,
    PubMetaFilterComponent,
    ContentItemsStatusComponent,
    ContentItemsActionsComponent,
    ContentItemsEntityComponent,
    ContentItemImportComponent,
    CreateMetadataDialogComponent,
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
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatRippleModule,
    MatSnackBarModule,
    EcoFabSpeedDialModule,
    MatMenuModule,
    ReactiveFormsModule,
  ],
  providers: [
    Context,
    ContentItemsService,
    EntitiesService,
    ContentExportService,
    ContentTypesService,
  ]
})
export class ContentItemsModule { }

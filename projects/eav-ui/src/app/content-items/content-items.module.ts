import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatBadgeModule } from '@angular/material/badge';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatRippleModule } from '@angular/material/core';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacyRadioModule as MatRadioModule } from '@angular/material/legacy-radio';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacySlideToggleModule as MatSlideToggleModule } from '@angular/material/legacy-slide-toggle';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';
import { ContentTypesService } from '../app-administration/services/content-types.service';
import { ContentExportService } from '../content-export/services/content-export.service';
import { SxcGridModule } from '../shared/modules/sxc-grid-module/sxc-grid.module';
import { Context } from '../shared/services/context';
import { SharedComponentsModule } from '../shared/shared-components.module';
import { ContentItemImportComponent } from './content-item-import/content-item-import.component';
import { ContentItemsActionsComponent } from './content-items-actions/content-items-actions.component';
import { ContentItemsEntityComponent } from './content-items-entity/content-items-entity.component';
import { ContentItemsRoutingModule } from './content-items-routing.module';
import { ContentItemsStatusComponent } from './content-items-status/content-items-status.component';
import { ContentItemsComponent } from './content-items.component';
import { CreateMetadataDialogComponent } from './create-metadata-dialog/create-metadata-dialog.component';
import { PubMetaFilterComponent } from './pub-meta-filter/pub-meta-filter.component';
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
    SxcGridModule,
    FormsModule,
    MatRadioModule,
    MatInputModule,
    MatSelectModule,
    MatRippleModule,
    MatSnackBarModule,
    MatMenuModule,
    ReactiveFormsModule,
    MatSlideToggleModule,
    MatBadgeModule,
  ],
  providers: [
    Context,
    ContentItemsService,
    EntitiesService,
    ContentExportService,
    ContentTypesService,
  ],
})
export class ContentItemsModule { }

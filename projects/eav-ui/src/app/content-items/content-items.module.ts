import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatRadioModule } from '@angular/material/radio';
import { MAT_SELECT_CONFIG, MatSelectModule } from '@angular/material/select';
import { MAT_SLIDE_TOGGLE_DEFAULT_OPTIONS, MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ContentTypesService } from '../app-administration/services/content-types.service';
import { ContentExportService } from '../content-export/services/content-export.service';
import { SxcGridModule } from '../shared/modules/sxc-grid-module/sxc-grid.module';
import { Context } from '../shared/services/context';
import { SharedComponentsModule } from '../shared/shared-components.module';
import { ImportContentItemComponent } from './import-content-item/import-content-item.component';
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
    ImportContentItemComponent,
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
    { provide: MAT_SELECT_CONFIG, useValue: { hideSingleSelectionIndicator: true } },
    { provide: MAT_SLIDE_TOGGLE_DEFAULT_OPTIONS, useValue: { hideIcon: true } }
  ],
})
export class ContentItemsModule { }

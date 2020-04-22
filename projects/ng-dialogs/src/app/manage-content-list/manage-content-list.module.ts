import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { ManageContentListRoutingModule } from './manage-content-list-routing.module';
import { ManageContentListComponent } from './manage-content-list.component';
import { SharedComponentsModule } from '../shared/shared-components.module';
import { Context } from '../shared/services/context';
import { ContentGroupService } from './services/content-group.service';

@NgModule({
  declarations: [
    ManageContentListComponent,
  ],
  entryComponents: [
    ManageContentListComponent,
  ],
  imports: [
    CommonModule,
    ManageContentListRoutingModule,
    SharedComponentsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    DragDropModule,
    MatSnackBarModule,
  ],
  providers: [
    Context,
    ContentGroupService,
  ]
})
export class ManageContentListModule { }

import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Context } from '../shared/services/context';
import { SharedComponentsModule } from '../shared/shared-components.module';
import { ManageContentListRoutingModule } from './manage-content-list-routing.module';
import { ManageContentListComponent } from './manage-content-list.component';
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

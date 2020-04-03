import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ManageContentListRoutingModule } from './manage-content-list-routing.module';
import { ManageContentListComponent } from './manage-content-list.component';
import { SharedComponentsModule } from '../shared/components/shared-components.module';
import { Context } from '../shared/context/context';
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
  ],
  providers: [
    Context,
    ContentGroupService,
  ]
})
export class ManageContentListModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { ReplaceContentRoutingModule } from './replace-content-routing.module';
import { ReplaceContentComponent } from './replace-content.component';
import { SharedComponentsModule } from '../shared/shared-components.module';
import { Context } from '../shared/services/context';
import { ContentGroupService } from '../manage-content-list/services/content-group.service';

@NgModule({
  declarations: [
    ReplaceContentComponent,
  ],
  entryComponents: [
    ReplaceContentComponent,
  ],
  imports: [
    CommonModule,
    ReplaceContentRoutingModule,
    SharedComponentsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    MatSnackBarModule,
  ],
  providers: [
    Context,
    ContentGroupService,
  ]
})
export class ReplaceContentModule { }

import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ContentGroupService } from '../manage-content-list/services/content-group.service';
import { Context } from '../shared/services/context';
import { SharedComponentsModule } from '../shared/shared-components.module';
import { ReplaceContentRoutingModule } from './replace-content-routing.module';
import { ReplaceContentComponent } from './replace-content.component';

@NgModule({
  declarations: [
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
    MatAutocompleteModule,
    MatInputModule,
    ScrollingModule,
  ],
  providers: [
    Context,
    ContentGroupService,
  ]
})
export class ReplaceContentModule { }

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { SourceService } from '../code-editor/services/source.service';
import { CreateFileDialogComponent } from '../create-file-dialog/create-file-dialog.component';
import { Context } from '../shared/services/context';
import { SharedComponentsModule } from '../shared/shared-components.module';

@NgModule({
  declarations: [
    CreateFileDialogComponent,
  ],
  imports: [
    CommonModule,
    SharedComponentsModule,
    MatButtonModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  exports: [
    CreateFileDialogComponent,
  ],
  providers: [
    Context,
    SourceService,
  ],
})
export class CreateFileDialogModule { }

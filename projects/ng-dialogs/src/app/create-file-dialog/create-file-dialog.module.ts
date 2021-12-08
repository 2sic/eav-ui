import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { CreateFileDialogComponent } from '.';
import { SourceService } from '../code-editor/services/source.service';
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
    MatProgressSpinnerModule,
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

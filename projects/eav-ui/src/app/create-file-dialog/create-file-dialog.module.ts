import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MAT_SELECT_CONFIG, MatSelectModule } from '@angular/material/select';
import { CreateFileDialogComponent, FileLocationDialogComponent } from '.';
import { SourceService } from '../code-editor/services/source.service';
import { Context } from '../shared/services/context';
import { SharedComponentsModule } from '../shared/shared-components.module';
import { MatCardModule } from '@angular/material/card';

@NgModule({
  declarations: [
    CreateFileDialogComponent,
    FileLocationDialogComponent,
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
    MatCardModule,
  ],
  exports: [
    CreateFileDialogComponent,
    FileLocationDialogComponent,
  ],
  providers: [
    Context,
    SourceService,
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { subscriptSizing: 'dynamic' } },
    { provide: MAT_SELECT_CONFIG, useValue: { hideSingleSelectionIndicator: true } }
  ],
})
export class CreateFileDialogModule { }

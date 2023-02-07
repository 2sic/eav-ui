import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { CreateFileDialogComponent, FileLocationDialogComponent } from '.';
import { SourceService } from '../code-editor/services/source.service';
import { Context } from '../shared/services/context';
import { SharedComponentsModule } from '../shared/shared-components.module';

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
  ],
  exports: [
    CreateFileDialogComponent,
    FileLocationDialogComponent,
  ],
  providers: [
    Context,
    SourceService,
  ],
})
export class CreateFileDialogModule { }

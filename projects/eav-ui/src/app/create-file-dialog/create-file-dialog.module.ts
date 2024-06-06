import { NgModule } from '@angular/core';
import { CreateFileDialogComponent, FileLocationDialogComponent } from '.';
import { Context } from '../shared/services/context';
@NgModule({
  imports: [
    CreateFileDialogComponent,
    FileLocationDialogComponent,
  ],
  exports: [
    CreateFileDialogComponent,
    FileLocationDialogComponent,
  ],
  providers: [
    Context,
    // SourceService,
    // @2dg, no impact of style since angular 16+
    // { provide: MAT_SELECT_CONFIG, useValue: { hideSingleSelectionIndicator: true } },
    // @2dg Check, if this is needed
    // { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { subscriptSizing: 'dynamic' } },
  ],
})
export class CreateFileDialogModule { }

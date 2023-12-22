import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MAT_SELECT_CONFIG, MatSelectModule } from '@angular/material/select';
import { MAT_SLIDE_TOGGLE_DEFAULT_OPTIONS, MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { ContentTypesService } from '../app-administration/services/content-types.service';
import { MetadataService } from '../permissions/services/metadata.service';
import { Context } from '../shared/services/context';
import { SharedComponentsModule } from '../shared/shared-components.module';
import { AddExplorerComponent } from './add-explorer/add-explorer.component';
import { PlumbEditorComponent } from './plumb-editor/plumb-editor.component';
import { RenameStreamComponent } from './plumb-editor/rename-stream/rename-stream.component';
import { QueryResultComponent } from './query-result/query-result.component';
import { RunExplorerComponent } from './run-explorer/run-explorer.component';
import { QueryDefinitionService } from './services/query-definition.service';
import { StreamErrorResultComponent } from './stream-error-result/stream-error-result.component';
import { VisualQueryRoutingModule } from './visual-query-routing.module';
import { VisualQueryComponent } from './visual-query.component';

@NgModule({
  declarations: [
    VisualQueryComponent,
    RunExplorerComponent,
    AddExplorerComponent,
    PlumbEditorComponent,
    QueryResultComponent,
    StreamErrorResultComponent,
    RenameStreamComponent,
  ],
  imports: [
    CommonModule,
    SharedComponentsModule,
    VisualQueryRoutingModule,
    MatIconModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatDialogModule,
    MatTabsModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatInputModule,
  ],
  providers: [
    Context,
    QueryDefinitionService,
    MetadataService,
    ContentTypesService,
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { subscriptSizing: 'dynamic' } },
    { provide: MAT_SELECT_CONFIG, useValue: { hideSingleSelectionIndicator: true } },
    { provide: MAT_SLIDE_TOGGLE_DEFAULT_OPTIONS, useValue: { hideIcon: true } }
  ],
})
export class VisualQueryModule { }

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacySlideToggleModule as MatSlideToggleModule } from '@angular/material/legacy-slide-toggle';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';
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
    MatSlideToggleModule,
  ],
  providers: [
    Context,
    QueryDefinitionService,
    MetadataService,
    ContentTypesService,
  ],
})
export class VisualQueryModule { }

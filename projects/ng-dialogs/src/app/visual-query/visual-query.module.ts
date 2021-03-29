import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ContentTypesService } from '../app-administration/services/content-types.service';
import { MetadataService } from '../permissions/services/metadata.service';
import { Context } from '../shared/services/context';
import { SharedComponentsModule } from '../shared/shared-components.module';
import { AddExplorerComponent } from './add-explorer/add-explorer.component';
import { PlumbEditorComponent } from './plumb-editor/plumb-editor.component';
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
  ],
  entryComponents: [
    VisualQueryComponent,
    RunExplorerComponent,
    AddExplorerComponent,
    PlumbEditorComponent,
    QueryResultComponent,
    StreamErrorResultComponent,
  ],
  imports: [
    CommonModule,
    SharedComponentsModule,
    VisualQueryRoutingModule,
    MatIconModule,
    MatTooltipModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatDialogModule,
  ],
  providers: [
    Context,
    QueryDefinitionService,
    MetadataService,
    ContentTypesService,
  ],
})
export class VisualQueryModule { }

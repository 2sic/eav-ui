import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { VisualQueryRoutingModule } from './visual-query-routing.module';
import { VisualQueryComponent } from './visual-query.component';
import { Context } from '../shared/services/context';
import { QueryDefinitionService } from './services/query-definition.service';
import { RunExplorerComponent } from './run-explorer/run-explorer.component';
import { AddExplorerComponent } from './add-explorer/add-explorer.component';
import { PlumbEditorComponent } from './plumb-editor/plumb-editor.component';
import { PlumbGuiService } from './services/plumb-gui.service';
import { MetadataService } from '../permissions/services/metadata.service';
import { ContentTypesService } from '../app-administration/shared/services/content-types.service';
import { SharedComponentsModule } from '../shared/shared-components.module';

@NgModule({
  declarations: [
    VisualQueryComponent,
    RunExplorerComponent,
    AddExplorerComponent,
    PlumbEditorComponent,
  ],
  entryComponents: [
    VisualQueryComponent,
    RunExplorerComponent,
    AddExplorerComponent,
    PlumbEditorComponent,
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
  ],
  providers: [
    Context,
    QueryDefinitionService,
    PlumbGuiService,
    MetadataService,
    ContentTypesService,
  ]
})
export class VisualQueryModule { }
